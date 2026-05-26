/**
 * Verify Page
 * Search by blob ID or file ID to verify ownership and authenticity
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WalletButton } from '@/components/WalletButton';

export default function VerifyPage() {
  const router = useRouter();
  const [blobId, setBlobId] = useState('');
  const [fileId, setFileId] = useState('');

  const handleVerifyBlob = (e: React.FormEvent) => {
    e.preventDefault();
    if (blobId.trim()) {
      router.push(`/verify/${encodeURIComponent(blobId.trim())}`);
    }
  };

  const handleVerifyFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileId.trim()) {
      router.push(`/files/${encodeURIComponent(fileId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Home
          </Link>
          <WalletButton />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-5xl font-bold mb-4">
              Public <span className="text-blue-400">Verification</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Anyone can verify file authenticity, ownership, and history on the blockchain
            </p>
          </div>

          {/* Verify by Blob ID */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold mb-2">Verify by Walrus Blob ID</h2>
            <p className="text-gray-400 text-sm mb-4">
              Check if a blob exists on Walrus and view its blockchain provenance
            </p>
            <form onSubmit={handleVerifyBlob} className="flex gap-3">
              <input
                type="text"
                value={blobId}
                onChange={(e) => setBlobId(e.target.value)}
                placeholder="Paste a Walrus blob ID..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="submit"
                disabled={!blobId.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Verify by File ID */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 mb-6">
            <h2 className="text-2xl font-bold mb-2">Verify by Sui Object ID</h2>
            <p className="text-gray-400 text-sm mb-4">
              View the full version history of a file on the Sui blockchain
            </p>
            <form onSubmit={handleVerifyFile} className="flex gap-3">
              <input
                type="text"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
                placeholder="Paste a Sui object ID (0x...)..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
              <button
                type="submit"
                disabled={!fileId.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
              >
                View History
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/30 p-6 rounded-lg text-center">
              <div className="text-3xl mb-2">⛓️</div>
              <h3 className="font-semibold mb-1">On-Chain Proof</h3>
              <p className="text-xs text-gray-400">
                Every version recorded on Sui blockchain
              </p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-lg text-center">
              <div className="text-3xl mb-2">🗄️</div>
              <h3 className="font-semibold mb-1">Walrus Storage</h3>
              <p className="text-xs text-gray-400">
                Decentralized, content-addressed blobs
              </p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-lg text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold mb-1">Cryptographic</h3>
              <p className="text-xs text-gray-400">
                Tamper-proof, immutable records
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
