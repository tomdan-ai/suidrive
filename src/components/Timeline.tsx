/**
 * Timeline Component
 * Visual timeline for file version history
 */

'use client';

import { formatDate } from '@/lib/utils';
import type { TimelineVersion } from '@/types';

interface TimelineProps {
  versions: TimelineVersion[];
  selectedVersion?: number;
  onVersionSelect: (version: TimelineVersion) => void;
}

export function Timeline({ versions, selectedVersion, onVersionSelect }: TimelineProps) {
  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No versions found
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />

      {/* Version nodes */}
      <div className="space-y-6">
        {versions.map((version, index) => {
          const isSelected = selectedVersion === version.version;
          const isLatest = index === versions.length - 1;

          return (
            <div
              key={version.versionId}
              className="relative pl-20 cursor-pointer group"
              onClick={() => onVersionSelect(version)}
            >
              {/* Node */}
              <div
                className={`absolute left-6 w-5 h-5 rounded-full border-4 transition-all ${
                  isSelected
                    ? 'bg-blue-500 border-blue-500 scale-125'
                    : 'bg-gray-800 border-gray-600 group-hover:border-blue-400'
                }`}
              />

              {/* Content card */}
              <div
                className={`bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border transition-all ${
                  isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-gray-700 group-hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Version {version.version}
                      {isLatest && (
                        <span className="ml-2 text-xs bg-green-600 px-2 py-1 rounded">
                          Latest
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatDate(version.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Blob ID</p>
                    <p className="text-xs font-mono text-gray-400">
                      {version.blobId.substring(0, 8)}...
                    </p>
                  </div>
                </div>

                {version.summary && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {version.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
