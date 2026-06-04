/**
 * Sui Client Hook
 * Provides access to Sui client from zkLogin context
 */

'use client';

import { useZkLogin } from '@/contexts/ZkLoginProvider';

export function useSuiClient() {
  const { suiClient } = useZkLogin();
  return suiClient;
}
