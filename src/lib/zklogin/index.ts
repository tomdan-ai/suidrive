/**
 * zkLogin Utilities
 * Handles ephemeral keypair generation, nonce computation, address derivation,
 * and ZK proof requests for Google Sign-In → Sui wallet flow.
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { PublicKey } from '@mysten/sui/cryptography';
import {
  generateNonce,
  generateRandomness,
  getZkLoginSignature,
  jwtToAddress,
  decodeJwt,
  getExtendedEphemeralPublicKey,
} from '@mysten/sui/zklogin';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

// ============================================================================
// Types
// ============================================================================

export interface ZkLoginSession {
  ephemeralKeypair: Ed25519Keypair;
  maxEpoch: number;
  randomness: string;
  nonce: string;
}

export interface ZkLoginAccount {
  address: string;
  jwt: string;
  salt: string;
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  zkProof: ZkProofResult | null;
  session: ZkLoginSession;
}

export interface ZkProofResult {
  proofPoints: {
    a: string[];
    b: string[][];
    c: string[];
  };
  issBase64Details: {
    value: string;
    indexMod4: number;
  };
  headerBase64: string;
  addressSeed: string;
}

interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  nonce: string;
  email?: string;
  name?: string;
  picture?: string;
  exp: number;
  iat: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'suidrive_zklogin_session';
const ACCOUNT_KEY = 'suidrive_zklogin_account';
const PROVER_URL = 'https://prover-dev.mystenlabs.com/v1';

// ============================================================================
// Session Management
// ============================================================================

/**
 * Create a new ephemeral session for zkLogin
 */
export async function createZkLoginSession(
  suiClient: SuiJsonRpcClient
): Promise<ZkLoginSession> {
  const ephemeralKeypair = new Ed25519Keypair();
  const { epoch } = await suiClient.getLatestSuiSystemState();
  // Session valid for ~24 hours (current epoch + 2)
  const maxEpoch = Number(epoch) + 2;
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralKeypair.getPublicKey(), maxEpoch, randomness);

  const session: ZkLoginSession = {
    ephemeralKeypair,
    maxEpoch,
    randomness,
    nonce,
  };

  // Store session for persistence across page reloads
  saveSession(session);

  return session;
}

/**
 * Save session to localStorage (keypair serialized)
 */
function saveSession(session: ZkLoginSession): void {
  if (typeof window === 'undefined') return;
  const serialized = {
    secretKey: session.ephemeralKeypair.getSecretKey(),
    maxEpoch: session.maxEpoch,
    randomness: session.randomness,
    nonce: session.nonce,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
}

/**
 * Load session from localStorage
 */
export function loadSession(): ZkLoginSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const ephemeralKeypair = Ed25519Keypair.fromSecretKey(parsed.secretKey);
    return {
      ephemeralKeypair,
      maxEpoch: parsed.maxEpoch,
      randomness: parsed.randomness,
      nonce: parsed.nonce,
    };
  } catch {
    return null;
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
}

// ============================================================================
// Account Management
// ============================================================================

/**
 * Save account info to localStorage
 */
export function saveAccount(account: Omit<ZkLoginAccount, 'session'>): void {
  if (typeof window === 'undefined') return;
  const serialized = {
    address: account.address,
    jwt: account.jwt,
    salt: account.salt,
    sub: account.sub,
    email: account.email,
    name: account.name,
    picture: account.picture,
    zkProof: account.zkProof,
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(serialized));
}

/**
 * Load account from localStorage
 */
export function loadAccount(): Omit<ZkLoginAccount, 'session'> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ACCOUNT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ============================================================================
// Google OAuth
// ============================================================================

/**
 * Build the Google OAuth URL for zkLogin
 */
export function getGoogleLoginUrl(nonce: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured');

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce: nonce,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ============================================================================
// JWT & Address
// ============================================================================

/**
 * Decode a JWT and extract claims
 */
export function parseJwt(jwt: string): JwtPayload {
  return decodeJwt(jwt) as unknown as JwtPayload;
}

/**
 * Derive the Sui address from a JWT + salt
 */
export function deriveAddress(jwt: string, salt: string): string {
  return jwtToAddress(jwt, BigInt(salt), false);
}

// ============================================================================
// Salt Service
// ============================================================================

/**
 * Get or generate a deterministic user salt.
 * Uses our backend salt service which derives a stable salt from the JWT subject.
 */
export async function getUserSalt(jwt: string): Promise<string> {
  const response = await fetch('/api/zklogin/salt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt }),
  });

  if (!response.ok) {
    throw new Error('Failed to get user salt');
  }

  const { salt } = await response.json();
  return salt;
}

// ============================================================================
// ZK Proof
// ============================================================================

/**
 * Request a ZK proof from the Mysten prover service
 */
export async function getZkProof(params: {
  jwt: string;
  ephemeralPublicKey: PublicKey;
  maxEpoch: number;
  randomness: string;
  salt: string;
}): Promise<ZkProofResult> {
  const { jwt, ephemeralPublicKey, maxEpoch, randomness, salt } = params;

  // The prover expects the extended ephemeral public key
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(ephemeralPublicKey);

  const response = await fetch(PROVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey,
      maxEpoch,
      jwtRandomness: randomness,
      salt,
      keyClaimName: 'sub',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ZK proof generation failed: ${errorText}`);
  }

  return response.json();
}

// ============================================================================
// Transaction Signing
// ============================================================================

/**
 * Create a zkLogin signature for a transaction
 */
export function createZkLoginSignature(params: {
  userSignature: string;
  zkProof: ZkProofResult;
  maxEpoch: number;
}): string {
  const { userSignature, zkProof, maxEpoch } = params;

  return getZkLoginSignature({
    inputs: {
      ...zkProof,
      addressSeed: zkProof.addressSeed,
    },
    maxEpoch,
    userSignature,
  });
}
