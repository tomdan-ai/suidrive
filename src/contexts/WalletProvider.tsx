/**
 * Wallet Provider
 * Wraps the app with Sui wallet connectivity
 */

'use client';

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Configure Sui network
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

// Create React Query client
const queryClient = new QueryClient();

export function SuiWalletProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
