/**
 * Dashboard Page
 * View user's files and version history
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FileObject } from '@/types';

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // TODO: Implement API endpoint to fetch files
      // const response = await fetch(`/api/files?owner=${walletAddress}`);
      // const data = await response.json();
      // setFiles(data.files);

      // Mock data for now
      setFiles([]);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-blue-400">Dashboard</span>
            </h1>
            <p className="text-gray-300">View your immutable file history</p>
          </div>
          <Link
            href="/upload"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            + Upload File
          </Link>
        </div>

        {/* Wallet Input */}
        <div className="max-w-2xl mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={loadFiles}
              disabled={!walletAddress || loading}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {loading ? 'Loading...' : 'Load Files'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            zkLogin authentication coming soon
          </p>
        </div>

        {/* Files List */}
        {files.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold mb-2">No Files Yet</h2>
            <p className="text-gray-400 mb-6">
              Upload your first file to get started
            </p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Upload File
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => (
              <FileCard key={file.fileId} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: FileObject }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">{file.name || 'Unnamed File'}</h3>
          <p className="text-sm text-gray-400">
            File ID: <code className="text-blue-400">{file.fileId}</code>
          </p>
          <p className="text-sm text-gray-400">
            Versions: {file.latestVersion}
          </p>
        </div>
        <Link
          href={`/files/${file.fileId}`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
        >
          View History
        </Link>
      </div>
    </div>
  );
}
