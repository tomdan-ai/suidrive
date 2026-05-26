/**
 * Version Comparison Component
 * Compare two versions side-by-side using AI
 */

'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { TimelineVersion } from '@/types';

interface VersionComparisonProps {
  versions: TimelineVersion[];
  fileName: string;
  mimeType?: string;
}

export function VersionComparison({ versions, fileName, mimeType }: VersionComparisonProps) {
  const [oldVersionId, setOldVersionId] = useState<string>('');
  const [newVersionId, setNewVersionId] = useState<string>('');
  const [comparison, setComparison] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oldVersion = versions.find((v) => v.versionId === oldVersionId);
  const newVersion = versions.find((v) => v.versionId === newVersionId);

  const canCompare =
    oldVersion && newVersion && oldVersion.versionId !== newVersion.versionId;

  const handleCompare = async () => {
    if (!canCompare || !oldVersion || !newVersion) return;

    setLoading(true);
    setError(null);
    setComparison(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          mimeType,
          oldSummary: oldVersion.summary,
          newSummary: newVersion.summary,
          oldBlobId: oldVersion.blobId,
          newBlobId: newVersion.blobId,
          oldTimestamp: oldVersion.timestamp,
          newTimestamp: newVersion.timestamp,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
      }

      setComparison(data.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  if (versions.length < 2) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-2">🔄 Compare Versions</h3>
      <p className="text-sm text-gray-400 mb-4">
        AI-powered analysis of changes between any two versions
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Old Version Selector */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">From Version</label>
          <select
            value={oldVersionId}
            onChange={(e) => setOldVersionId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">Select older version...</option>
            {versions.map((v) => (
              <option key={v.versionId} value={v.versionId}>
                Version {v.version} — {formatDate(v.timestamp)}
              </option>
            ))}
          </select>
        </div>

        {/* New Version Selector */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">To Version</label>
          <select
            value={newVersionId}
            onChange={(e) => setNewVersionId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">Select newer version...</option>
            {versions.map((v) => (
              <option key={v.versionId} value={v.versionId}>
                Version {v.version} — {formatDate(v.timestamp)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!canCompare || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition mb-4"
      >
        {loading ? 'Analyzing changes...' : 'Compare with AI'}
      </button>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300 mb-4">
          {error}
        </div>
      )}

      {comparison && oldVersion && newVersion && (
        <div className="space-y-4">
          {/* Side-by-side summaries */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 mb-2">
                Version {oldVersion.version} ({formatDate(oldVersion.timestamp)})
              </p>
              <p className="text-sm text-gray-300">
                {oldVersion.summary || 'No summary available'}
              </p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500 mb-2">
                Version {newVersion.version} ({formatDate(newVersion.timestamp)})
              </p>
              <p className="text-sm text-gray-300">
                {newVersion.summary || 'No summary available'}
              </p>
            </div>
          </div>

          {/* AI Comparison */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-700/50">
            <p className="text-xs text-blue-400 mb-2 font-semibold">🤖 AI Analysis</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{comparison}</p>
          </div>
        </div>
      )}
    </div>
  );
}
