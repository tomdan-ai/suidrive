/**
 * Dashboard Page
 * View user's files and version history
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@/hooks/useSuiClient';
import { WalletButton } from '@/components/WalletButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileObject } from '@/types';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

interface DashboardFile extends FileObject {
  totalSize?: number;
  versionCount?: number;
}

export default function DashboardPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'versions'>('newest');

  useEffect(() => {
    if (!account || !PACKAGE_ID) return;

    async function loadFiles() {
      if (!account) return; // Type guard
      
      setLoading(true);
      try {
        // Fetch all FileObjects owned by the user
        const fileObjects = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::file_object::FileObject`,
          },
          options: {
            showContent: true,
          },
        });

        // Fetch all VersionObjects to compute version counts and sizes
        const versionObjects = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::version_object::VersionObject`,
          },
          options: {
            showContent: true,
          },
        });

        // Build a map: fileId -> { count, totalSize }
        const versionStats = new Map<string, { count: number; totalSize: number }>();
        for (const obj of versionObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fileId = fields.file_id;
            const size = parseInt(fields.size || '0');
            const existing = versionStats.get(fileId) || { count: 0, totalSize: 0 };
            versionStats.set(fileId, {
              count: existing.count + 1,
              totalSize: existing.totalSize + size,
            });
          }
        }

        const fileList: DashboardFile[] = [];

        for (const obj of fileObjects.data) {
          if (obj.data && obj.data.content && obj.data.content.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fileId = fields.file_id;
            const stats = versionStats.get(fileId);
            fileList.push({
              objectId: obj.data.objectId,
              fileId,
              owner: fields.owner,
              latestVersion: parseInt(fields.latest_version),
              createdAt: parseInt(fields.created_at),
              name: fields.name,
              mimeType: fields.mime_type,
              versionCount: stats?.count || 0,
              totalSize: stats?.totalSize || 0,
            });
          }
        }

        setFiles(fileList);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [account, client]);

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.mimeType?.toLowerCase().includes(q) ||
          f.fileId.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'versions':
        result.sort((a, b) => (b.versionCount || 0) - (a.versionCount || 0));
        break;
    }

    return result;
  }, [files, searchQuery, sortBy]);

  // Compute aggregate stats
  const totalStorage = files.reduce((sum, f) => sum + (f.totalSize || 0), 0);
  const totalVersions = files.reduce((sum, f) => sum + (f.versionCount || 0), 0);

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
              href="/verify"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              🔍 Verify
            </Link>
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
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Total Files</p>
                <p className="text-3xl font-bold">{files.length}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Total Versions</p>
                <p className="text-3xl font-bold">{totalVersions}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Storage Used</p>
                <p className="text-3xl font-bold">{formatBytes(totalStorage)}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-1">Latest Upload</p>
                <p className="text-lg font-semibold">
                  {files.length > 0
                    ? formatDate([...files].sort((a, b) => b.createdAt - a.createdAt)[0].createdAt)
                    : '—'}
                </p>
              </div>
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, type, or file ID..."
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name (A-Z)</option>
                <option value="versions">Most versions</option>
              </select>
            </div>

            {/* Files List */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No files match your search.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <FileCard key={file.fileId} file={file} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: DashboardFile }) {
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
                <span className="text-gray-500">Versions:</span> {file.versionCount ?? file.latestVersion}
              </span>
              {file.totalSize !== undefined && file.totalSize > 0 && (
                <span>
                  <span className="text-gray-500">Size:</span> {formatBytes(file.totalSize)}
                </span>
              )}
              <span>
                <span className="text-gray-500">Created:</span> {formatDate(file.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-mono truncate">
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
