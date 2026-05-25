/**
 * File Detail Page
 * Shows file metadata and version history timeline
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFileHistory } from '@/hooks/useFileHistory';
import { Timeline } from '@/components/Timeline';
import { WalletButton } from '@/components/WalletButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { TimelineVersion } from '@/types';

export default function FileDetailPage({ params }: { params: { fileId: string } }) {
  const { fileHistory, loading, error } = useFileHistory(params.fileId);
  const [selectedVersion, setSelectedVersion] = useState<TimelineVersion | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading file history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fileHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold mb-4">File Not Found</h1>
            <p className="text-gray-400 mb-8">
              {error || 'The file you are looking for does not exist.'}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestVersion = fileHistory.versions[fileHistory.versions.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
          <WalletButton />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* File Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 sticky top-4">
              <h1 className="text-2xl font-bold mb-4 break-words">
                {fileHistory.file.name || 'Unnamed File'}
              </h1>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">File ID</p>
                  <p className="text-sm font-mono text-gray-300 break-all">
                    {fileHistory.file.fileId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm text-gray-300">
                    {fileHistory.file.mimeType || 'Unknown'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm text-gray-300">
                    {formatDate(fileHistory.file.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Versions</p>
                  <p className="text-sm text-gray-300">
                    {fileHistory.versions.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Owner</p>
                  <p className="text-xs font-mono text-gray-300 break-all">
                    {fileHistory.file.owner}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <a
                  href={`https://aggregator.walrus-testnet.walrus.space/v1/${latestVersion.blobId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition"
                >
                  Download Latest
                </a>
                <Link
                  href={`/upload?fileId=${fileHistory.file.fileId}`}
                  className="block w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-center transition"
                >
                  Upload New Version
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Version History</h2>
              <p className="text-gray-400">
                Click on a version to view details
              </p>
            </div>

            <Timeline
              versions={fileHistory.versions}
              selectedVersion={selectedVersion?.version}
              onVersionSelect={setSelectedVersion}
            />

            {/* Selected Version Details */}
            {selectedVersion && (
              <div className="mt-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-blue-500">
                <h3 className="text-xl font-bold mb-4">
                  Version {selectedVersion.version} Details
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                    <p className="text-sm text-gray-300">
                      {formatDate(selectedVersion.timestamp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Blob ID</p>
                    <p className="text-xs font-mono text-gray-300 break-all">
                      {selectedVersion.blobId}
                    </p>
                  </div>
                </div>

                {selectedVersion.summary && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">AI Summary</p>
                    <p className="text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg">
                      {selectedVersion.summary}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <a
                    href={`https://aggregator.walrus-testnet.walrus.space/v1/${selectedVersion.blobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Download
                  </a>
                  <a
                    href={`https://suiexplorer.com/object/${selectedVersion.versionId}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
