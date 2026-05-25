/**
 * Wallet Connection Button
 * Allows users to connect their Sui wallet
 */

'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { truncateAddress } from '@/lib/utils';

export function WalletButton() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-4">
      {account ? (
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="text-gray-400">Connected</div>
            <div className="font-mono text-blue-400">
              {truncateAddress(account.address)}
            </div>
          </div>
          <ConnectButton />
        </div>
      ) : (
        <ConnectButton />
      )}
    </div>
  );
}
