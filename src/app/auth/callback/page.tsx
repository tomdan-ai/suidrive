/**
 * OAuth Callback Page
 * Handles the Google Sign-In redirect, extracts the JWT from the URL fragment,
 * and completes the zkLogin flow.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { handleCallback } = useZkLogin();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        // The JWT is in the URL fragment (after #)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');

        if (!idToken) {
          setError('No authentication token received. Please try again.');
          return;
        }

        await handleCallback(idToken);
        // Redirect to dashboard on success
        router.replace('/dashboard');
      } catch (e) {
        console.error('Auth callback error:', e);
        setError(
          e instanceof Error
            ? e.message
            : 'Authentication failed. Please try again.'
        );
      }
    }

    processCallback();
  }, [handleCallback, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#01060b] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase italic">
            Sign-In Failed
          </h2>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => router.replace('/')}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:border-cyan-400/30 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#01060b] flex items-center justify-center">
      <div className="text-center space-y-6">
        <Loader2 size={40} className="text-cyan-400 animate-spin mx-auto" />
        <div className="space-y-2">
          <h2 className="text-lg font-black text-white uppercase italic">
            Creating Your Wallet
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-[3px]">
            Generating zero-knowledge proof...
          </p>
        </div>
      </div>
    </div>
  );
}
