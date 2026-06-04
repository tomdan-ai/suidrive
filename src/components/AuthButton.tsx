/**
 * Unified Auth Button
 * Shows both sign-in options:
 *   1. Google Sign-In (zkLogin) — for non-crypto users
 *   2. Connect Wallet — for crypto-native users
 *
 * When connected, shows the active address and a sign-out button.
 */

'use client';

import { useState } from 'react';
import { ConnectModal } from '@mysten/dapp-kit';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { truncateAddress } from '@/lib/utils';
import { LogOut, Loader2, Wallet, ChevronDown } from 'lucide-react';

export function AuthButton() {
  const { account, address, authMethod, loading, signInWithGoogle, signOut } = useZkLogin();
  const [showOptions, setShowOptions] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  // --- Connected State ---
  if (address) {
    return (
      <div className="flex items-center gap-3">
        {authMethod === 'zklogin' && account?.picture && (
          <img
            src={account.picture}
            alt=""
            className="w-8 h-8 rounded-full border border-cyan-400/30"
          />
        )}
        {authMethod === 'wallet' && (
          <div className="w-8 h-8 rounded-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-center">
            <Wallet size={14} className="text-blue-400" />
          </div>
        )}
        <div className="text-sm">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            {authMethod === 'zklogin'
              ? (account?.email || 'Google')
              : 'Wallet'}
          </div>
          <div className="font-mono text-cyan-400 text-xs">
            {truncateAddress(address)}
          </div>
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-red-400"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // --- Disconnected State: show both options ---
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl transition-all"
      >
        <span className="text-sm font-semibold text-gray-300">Connect</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#0a1220] border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Google zkLogin Option */}
            <button
              onClick={() => {
                setShowOptions(false);
                signInWithGoogle();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
            >
              <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-cyan-400/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-200 group-hover:text-white">
                  Google
                </div>
                <div className="text-[10px] text-gray-500">
                  No wallet needed
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="my-1 mx-4 border-t border-white/5" />

            {/* Wallet Connect Option */}
            <button
              onClick={() => {
                setShowOptions(false);
                setWalletModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
            >
              <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-blue-400/30">
                <Wallet size={18} className="text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-200 group-hover:text-white">
                  Sui Wallet
                </div>
                <div className="text-[10px] text-gray-500">
                  Browser extension
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* dapp-kit wallet connect modal */}
      <ConnectModal
        trigger={<span />}
        open={walletModalOpen}
        onOpenChange={(open) => setWalletModalOpen(open)}
      />
    </div>
  );
}

/**
 * Simplified version for inline use (e.g., in the upload page "Protocol Locked" state).
 * Shows both options stacked vertically.
 */
export function AuthOptions() {
  const { signInWithGoogle } = useZkLogin();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full max-w-[260px]">
      <button
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl transition-all group w-full"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="text-sm font-semibold text-gray-300 group-hover:text-white">
          Sign in with Google
        </span>
      </button>

      <button
        onClick={() => setWalletModalOpen(true)}
        className="flex items-center justify-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/30 rounded-xl transition-all group w-full"
      >
        <Wallet size={18} className="text-blue-400" />
        <span className="text-sm font-semibold text-gray-300 group-hover:text-white">
          Connect Wallet
        </span>
      </button>

      <ConnectModal
        trigger={<span />}
        open={walletModalOpen}
        onOpenChange={(open) => setWalletModalOpen(open)}
      />
    </div>
  );
}
