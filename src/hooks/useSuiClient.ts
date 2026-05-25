/**
 * Sui Client Hook
 * Provides access to Sui client from dapp-kit context
 */

'use client';

import { useSuiClient as useBaseSuiClient } from '@mysten/dapp-kit';

export function useSuiClient() {
  return useBaseSuiClient();
}
