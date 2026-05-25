/**
 * Dashboard Page
 * View user's files and version history
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@/hooks/useSuiClient';
import { WalletButton } from '@/components/WalletButton';
import { formatDate } from '@/lib/utils';
import type { FileObject } from '@/types';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

export default function DashboardPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account || !PACKAGE_ID) return;

    async function loadFiles() {
      if (!account) return; // Type guard
      
      setLoading(true);
      try {
        const objects = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::file_object::FileObject`,
          },
          options: {
            showContent: true,
          },
        });

        const fileList: FileObject[] = [];

        for (const obj of objects.data) {
          if (obj.data && obj.data.content && obj.data.content.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            fileList.push({
              objectId: obj.data.objectId, // Store the actual Sui object ID
              fileId: fields.file_id,
              owner: fields.owner,
              latestVersion: parseInt(fields.latest_version),
              createdAt: parseInt(fields.created_at),
              name: fields.name,
              mimeType: fields.mime_type,
            });
          }
        }

        // Sort by creation date (newest first)
        fileList.sort((a, b) => b.createdAt - a.createdAt);

        setFiles(fileList);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [account, client]);

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
          <div className="flex gap-4">
            <Link
              href="/upload"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              + Upload File
            </Link>
            <WalletButton />
          </div>
        </div>

        {/* Content */}
        {!account ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your Sui wallet to view your files
            </p>
            <WalletButton />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
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
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Total Files</p>
                <p className="text-3xl font-bold">{files.length}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Total Versions</p>
                <p className="text-3xl font-bold">
                  {files.reduce((sum, f) => sum + f.latestVersion, 0)}
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Latest Upload</p>
                <p className="text-lg font-semibold">
                  {formatDate(files[0].createdAt)}
                </p>
              </div>
            </div>

            {/* Files List */}
            <div className="grid gap-4">
              {files.map((file) => (
                <FileCard key={file.fileId} file={file} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: FileObject }) {
  return (
    <Link href={`/files/${file.objectId}`}>
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{file.name || 'Unnamed File'}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>
                <span className="text-gray-500">Type:</span> {file.mimeType || 'Unknown'}
              </span>
              <span>
                <span className="text-gray-500">Versions:</span> {file.latestVersion}
              </span>
              <span>
                <span className="text-gray-500">Created:</span> {formatDate(file.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              {file.fileId}
            </p>
          </div>
          <div className="ml-4">
            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition">
              View History →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
