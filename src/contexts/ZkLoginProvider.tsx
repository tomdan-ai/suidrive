/**
 * Unified Auth Provider
 * Supports TWO connection methods:
 *   1. Google Sign-In → Sui wallet via zkLogin (for non-crypto users)
 *   2. Traditional wallet connect via dapp-kit (for crypto-native users)
 *
 * Both methods expose the same interface (address, signAndExecuteTransaction)
 * so the rest of the app doesn't need to care which method was used.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64, fromBase64 } from '@mysten/sui/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
  useCurrentAccount,
  useSignTransaction,
  useSignAndExecuteTransaction,
  useDisconnectWallet,
} from '@mysten/dapp-kit';
import {
  createZkLoginSession,
  loadSession,
  clearSession,
  getGoogleLoginUrl,
  parseJwt,
  deriveAddress,
  getUserSalt,
  getZkProof,
  createZkLoginSignature,
  saveAccount,
  loadAccount,
  type ZkLoginSession,
  type ZkLoginAccount,
  type ZkProofResult,
} from '@/lib/zklogin';

// ============================================================================
// Types
// ============================================================================

export type AuthMethod = 'zklogin' | 'wallet' | null;

export interface ZkLoginState {
  /** Whether we're initializing the session */
  loading: boolean;
  /** Currently authenticated account info (zkLogin only) */
  account: ZkLoginAccount | null;
  /** The active Sui address (works for both methods) */
  address: string | null;
  /** Which auth method is currently active */
  authMethod: AuthMethod;
  /** The SuiClient instance */
  suiClient: SuiJsonRpcClient;
  /** Initiate Google Sign-In (zkLogin) */
  signInWithGoogle: () => Promise<void>;
  /** Sign out (works for both methods) */
  signOut: () => void;
  /** Sign and execute a transaction (works for both methods) */
  signAndExecuteTransaction: (params: {
    transaction: Transaction;
    onSuccess?: (result: { digest: string }) => void;
    onError?: (error: Error) => void;
  }) => Promise<void>;
  /** Process the OAuth callback (called by auth/callback page) */
  handleCallback: (jwt: string) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const ZkLoginContext = createContext<ZkLoginState | null>(null);

export function useZkLogin(): ZkLoginState {
  const ctx = useContext(ZkLoginContext);
  if (!ctx) throw new Error('useZkLogin must be used within ZkLoginProvider');
  return ctx;
}

// ============================================================================
// Network Config (shared between dapp-kit and our custom client)
// ============================================================================

const { networkConfig } = createNetworkConfig({
  testnet: {
    url: 'https://fullnode.testnet.sui.io:443',
    network: 'testnet' as const,
  },
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443',
    network: 'mainnet' as const,
  },
});

const queryClient = new QueryClient();

const suiClient = new SuiJsonRpcClient({
  url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet'
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443',
  network: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
});

// ============================================================================
// Inner Provider (has access to dapp-kit hooks)
// ============================================================================

function ZkLoginInnerProvider({ children }: { children: ReactNode }) {
  // --- dapp-kit wallet state ---
  const walletAccount = useCurrentAccount();
  const { mutateAsync: walletSignTransaction } = useSignTransaction();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  // --- zkLogin state ---
  const [zkLoading, setZkLoading] = useState(true);
  const [zkAccount, setZkAccount] = useState<ZkLoginAccount | null>(null);
  const [zkSession, setZkSession] = useState<ZkLoginSession | null>(null);

  // --- Restore zkLogin session on mount ---
  useEffect(() => {
    async function restore() {
      try {
        const savedSession = loadSession();
        const savedAccount = loadAccount();

        if (savedSession && savedAccount) {
          const { epoch } = await suiClient.getLatestSuiSystemState();
          if (savedSession.maxEpoch > Number(epoch)) {
            setZkSession(savedSession);
            setZkAccount({ ...savedAccount, session: savedSession });
          } else {
            clearSession();
          }
        }
      } catch (e) {
        console.warn('Failed to restore zkLogin session:', e);
        clearSession();
      } finally {
        setZkLoading(false);
      }
    }
    restore();
  }, []);

  // --- Determine active auth method ---
  const authMethod: AuthMethod = zkAccount
    ? 'zklogin'
    : walletAccount
      ? 'wallet'
      : null;

  const address = zkAccount?.address ?? walletAccount?.address ?? null;
  const loading = zkLoading;

  // --- Google Sign-In ---
  const signInWithGoogle = useCallback(async () => {
    try {
      const newSession = await createZkLoginSession(suiClient);
      setZkSession(newSession);
      const loginUrl = getGoogleLoginUrl(newSession.nonce);
      window.location.href = loginUrl;
    } catch (e) {
      console.error('Google sign-in failed:', e);
      throw e;
    }
  }, []);

  // --- Handle OAuth callback ---
  const handleCallback = useCallback(async (jwt: string) => {
    const currentSession = loadSession();
    if (!currentSession) {
      throw new Error('No active session. Please sign in again.');
    }

    setZkLoading(true);
    try {
      const decoded = parseJwt(jwt);
      const salt = await getUserSalt(jwt);
      const addr = deriveAddress(jwt, salt);

      const ephemeralPublicKey = currentSession.ephemeralKeypair.getPublicKey();

      const zkProof = await getZkProof({
        jwt,
        ephemeralPublicKey,
        maxEpoch: currentSession.maxEpoch,
        randomness: currentSession.randomness,
        salt,
      });

      const newAccount: ZkLoginAccount = {
        address: addr,
        jwt,
        salt,
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        zkProof,
        session: currentSession,
      };

      setZkAccount(newAccount);
      setZkSession(currentSession);
      saveAccount(newAccount);
    } catch (e) {
      console.error('zkLogin callback failed:', e);
      clearSession();
      throw e;
    } finally {
      setZkLoading(false);
    }
  }, []);

  // --- Sign Out (both methods) ---
  const signOut = useCallback(() => {
    // Clear zkLogin
    setZkAccount(null);
    setZkSession(null);
    clearSession();
    // Disconnect wallet if connected
    if (walletAccount) {
      disconnectWallet();
    }
  }, [walletAccount, disconnectWallet]);

  // --- Unified Sign and Execute Transaction ---
  const signAndExecuteTransaction = useCallback(
    async (params: {
      transaction: Transaction;
      onSuccess?: (result: { digest: string }) => void;
      onError?: (error: Error) => void;
    }) => {
      const { transaction, onSuccess, onError } = params;

      if (authMethod === 'zklogin' && zkAccount && zkSession) {
        // --- zkLogin signing path (with gas sponsorship) ---
        if (!zkAccount.zkProof) {
          onError?.(new Error('ZK proof not available. Please sign in again.'));
          return;
        }

        try {
          transaction.setSender(zkAccount.address);

          // Step 1: Serialize unbuilt transaction and send to sponsor
          const serializedTx = transaction.serialize();
          const txBase64 = btoa(serializedTx);

          const prepareRes = await fetch('/api/sponsor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'prepare',
              txBytes: txBase64,
              sender: zkAccount.address,
            }),
          });

          if (!prepareRes.ok) {
            const err = await prepareRes.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to prepare sponsored transaction');
          }

          const { txBytes: sponsoredTxBase64 } = await prepareRes.json();
          const sponsoredTxBytes = fromBase64(sponsoredTxBase64);

          // Step 2: Sign the BUILT bytes with user's ephemeral key
          const { signature: userSignature } =
            await zkSession.ephemeralKeypair.signTransaction(sponsoredTxBytes);

          const zkLoginSig = createZkLoginSignature({
            userSignature,
            zkProof: zkAccount.zkProof,
            maxEpoch: zkSession.maxEpoch,
          });

          // Step 3: Execute — sponsor co-signs and submits
          const executeRes = await fetch('/api/sponsor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'execute',
              txBytes: sponsoredTxBase64,
              userSignature: zkLoginSig,
            }),
          });

          if (!executeRes.ok) {
            const err = await executeRes.json().catch(() => ({}));
            throw new Error(err.error || 'Sponsored transaction execution failed');
          }

          const result = await executeRes.json();
          onSuccess?.({ digest: result.digest });
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          console.error('zkLogin sponsored transaction failed:', error);
          onError?.(error);
        }
      } else if (authMethod === 'wallet' && walletAccount) {
        // --- Wallet signing path (also sponsored) ---
        try {
          transaction.setSender(walletAccount.address);

          // Step 1: Serialize unbuilt transaction and send to sponsor
          const serializedTx = transaction.serialize();
          const txBase64 = btoa(serializedTx);

          const prepareRes = await fetch('/api/sponsor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'prepare',
              txBytes: txBase64,
              sender: walletAccount.address,
            }),
          });

          if (!prepareRes.ok) {
            const err = await prepareRes.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to prepare sponsored transaction');
          }

          const { txBytes: sponsoredTxBase64 } = await prepareRes.json();

          // Step 2: User signs with their wallet
          const { signature: walletSig } = await walletSignTransaction({
            transaction: Transaction.from(fromBase64(sponsoredTxBase64)),
          });

          // Step 3: Execute with sponsor co-signature
          const executeRes = await fetch('/api/sponsor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'execute',
              txBytes: sponsoredTxBase64,
              userSignature: walletSig,
            }),
          });

          if (!executeRes.ok) {
            const err = await executeRes.json().catch(() => ({}));
            throw new Error(err.error || 'Sponsored transaction execution failed');
          }

          const result = await executeRes.json();
          onSuccess?.({ digest: result.digest });
        } catch (e) {
          const error = e instanceof Error ? e : new Error(String(e));
          console.error('Wallet sponsored transaction failed:', error);
          onError?.(error);
        }
      } else {
        onError?.(new Error('Not authenticated. Please sign in or connect a wallet.'));
      }
    },
    [authMethod, zkAccount, zkSession, walletAccount, walletSignTransaction]
  );

  const value: ZkLoginState = {
    loading,
    account: zkAccount,
    address,
    authMethod,
    suiClient,
    signInWithGoogle,
    signOut,
    signAndExecuteTransaction,
    handleCallback,
  };

  return (
    <ZkLoginContext.Provider value={value}>
      {children}
    </ZkLoginContext.Provider>
  );
}

// ============================================================================
// Outer Provider (wraps dapp-kit + our context)
// ============================================================================

export function ZkLoginProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <ZkLoginInnerProvider>
            {children}
          </ZkLoginInnerProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
