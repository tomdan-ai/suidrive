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
import { LogOut, Loader2, Wallet, ChevronDown, User } from 'lucide-react';

export function AuthButton() {
  const { account, address, authMethod, loading, signInWithGoogle, signOut } = useZkLogin();
  const [showOptions, setShowOptions] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // --- Connected State ---
  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1 pr-3 py-1 shadow-sm">
          {authMethod === 'zklogin' && account?.picture ? (
            <img
              src={account.picture}
              alt=""
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {authMethod === 'wallet' ? <Wallet size={14} /> : <User size={14} />}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase leading-none">
              {authMethod === 'zklogin' ? (account?.email?.split('@')[0] || 'Google') : 'Wallet'}
            </span>
            <span className="text-xs text-slate-800 font-mono leading-none mt-0.5">
              {truncateAddress(address)}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
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
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm font-medium text-sm"
      >
        <span>Sign in</span>
        <ChevronDown size={16} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white border border-slate-200 rounded-xl p-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Google zkLogin Option */}
            <button
              onClick={() => {
                setShowOptions(false);
                signInWithGoogle();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-slate-200 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">
                  Google
                </div>
                <div className="text-xs text-slate-500">
                  Standard account
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-slate-100" />

            {/* Wallet Connect Option */}
            <button
              onClick={() => {
                setShowOptions(false);
                setWalletModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100 shadow-sm">
                <Wallet size={16} />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">
                  Sui Wallet
                </div>
                <div className="text-xs text-slate-500">
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
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <button
        onClick={signInWithGoogle}
        className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors font-medium text-sm shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>

      <button
        onClick={() => setWalletModalOpen(true)}
        className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-sm shadow-sm"
      >
        <Wallet size={18} />
        Connect Wallet
      </button>

      <ConnectModal
        trigger={<span />}
        open={walletModalOpen}
        onOpenChange={(open) => setWalletModalOpen(open)}
      />
    </div>
  );
}
