/**
 * Blob Verification Page
 * Public verification of a Walrus blob and its on-chain provenance
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSuiClient } from '@/hooks/useSuiClient';
import { AuthButton } from '@/components/AuthButton';
import { formatDate, formatBytes, truncateAddress, getWalrusBlobUrl } from '@/lib/utils';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
const AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

interface BlobVerification {
  exists: boolean;
  size?: number;
  contentType?: string;
  etag?: string;
}

interface OnChainRecord {
  versionId: string;
  fileId: string;
  owner: string;
  timestamp: number;
  size: number;
  aiSummary?: string;
  fileName?: string;
  mimeType?: string;
}

export default function VerifyBlobPage({ params }: { params: Promise<{ blobId: string }> }) {
  const { blobId } = React.use(params);
  const decodedBlobId = decodeURIComponent(blobId);
  const client = useSuiClient();

  const [blobVerification, setBlobVerification] = useState<BlobVerification | null>(null);
  const [onChainRecord, setOnChainRecord] = useState<OnChainRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Verify blob exists on Walrus
        const walrusUrl = getWalrusBlobUrl(decodedBlobId, AGGREGATOR_URL);
        let walrusResponse: Response;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          walrusResponse = await fetch(walrusUrl, { method: 'HEAD', signal: controller.signal });
          clearTimeout(timeout);
        } catch (fetchErr) {
          // Network failure (SSL error, timeout, etc.)
          setBlobVerification({ exists: false });
          setError('Unable to reach Walrus storage network. The testnet may be temporarily unavailable. Your file is still safe — please try again later.');
          setLoading(false);
          return;
        }

        if (!walrusResponse.ok) {
          setBlobVerification({ exists: false });
          if (walrusResponse.status === 404) {
            setError('Blob not found on Walrus network. It may have expired or the ID is incorrect.');
          } else {
            setError(`Walrus returned an error (status ${walrusResponse.status}). Please try again.`);
          }
          setLoading(false);
          return;
        }

        setBlobVerification({
          exists: true,
          size: parseInt(walrusResponse.headers.get('content-length') || '0'),
          contentType: walrusResponse.headers.get('content-type') || 'application/octet-stream',
          etag: walrusResponse.headers.get('etag') || undefined,
        });

        // Step 2: Search for matching version on Sui blockchain
        if (PACKAGE_ID) {
          await findOnChainRecord(decodedBlobId);
        }
      } catch (err) {
        console.error('Verification error:', err);
        const msg = err instanceof Error ? err.message : 'Verification failed';
        if (msg.includes('Failed to fetch') || msg.includes('AbortError') || msg.includes('network')) {
          setError('Unable to connect to the network. Please check your connection and try again.');
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    }

    async function findOnChainRecord(targetBlobId: string) {
      try {
        // Query VersionCreated events to find the version with this blob ID
        const events = await client.queryEvents({
          query: {
            MoveEventType: `${PACKAGE_ID}::version_object::VersionCreated`,
          },
          limit: 1000,
          order: 'descending',
        });

        for (const event of events.data) {
          const fields = event.parsedJson as any;
          if (fields?.walrus_blob_id !== targetBlobId) continue;

          // Found the version event - now find the actual VersionObject
          // owned by the address that emitted it
          const ownerAddress = fields.owner;
          const versionId = fields.version_id;
          const fileId = fields.file_id;

          let versionDetails: any = null;
          try {
            const owned = await client.getOwnedObjects({
              owner: ownerAddress,
              filter: {
                StructType: `${PACKAGE_ID}::version_object::VersionObject`,
              },
              options: { showContent: true, showOwner: true },
            });

            for (const obj of owned.data) {
              if (obj.data?.content?.dataType === 'moveObject') {
                const vf = obj.data.content.fields as any;
                if (vf.version_id === versionId) {
                  versionDetails = vf;
                  break;
                }
              }
            }
          } catch (e) {
            console.warn('Could not fetch version object details:', e);
          }

          // Try to get the file metadata via FileCreated events
          let fileName: string | undefined;
          let mimeType: string | undefined;

          try {
            const fileEvents = await client.queryEvents({
              query: {
                MoveEventType: `${PACKAGE_ID}::file_object::FileCreated`,
              },
              limit: 1000,
              order: 'descending',
            });

            for (const fe of fileEvents.data) {
              const ff = fe.parsedJson as any;
              if (ff?.file_id === fileId) {
                fileName = ff.name;
                // FileCreated doesn't include mime_type, look at the file object instead
                break;
              }
            }

            // Fetch the FileObject to get the mime type
            const fileObjects = await client.getOwnedObjects({
              owner: ownerAddress,
              filter: {
                StructType: `${PACKAGE_ID}::file_object::FileObject`,
              },
              options: { showContent: true },
            });

            for (const obj of fileObjects.data) {
              if (obj.data?.content?.dataType === 'moveObject') {
                const ff = obj.data.content.fields as any;
                if (ff.file_id === fileId) {
                  fileName = fileName || ff.name;
                  mimeType = ff.mime_type;
                  break;
                }
              }
            }
          } catch (e) {
            console.warn('Could not fetch file metadata:', e);
          }

          setOnChainRecord({
            versionId,
            fileId,
            owner: ownerAddress,
            timestamp: parseInt(fields.timestamp),
            size: versionDetails?.size ? parseInt(versionDetails.size) : 0,
            aiSummary: versionDetails?.ai_summary || undefined,
            fileName,
            mimeType,
          });
          return;
        }
      } catch (err) {
        console.warn('On-chain lookup failed:', err);
      }
    }

    verify();
  }, [decodedBlobId, client]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/verify" className="text-gray-400 hover:text-white transition">
            ← Verify another file
          </Link>
          <AuthButton />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Verification Report</h1>
          <p className="text-sm font-mono text-gray-400 break-all mb-8">
            Blob ID: {decodedBlobId}
          </p>

          {loading ? (
            <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Verifying on Walrus and Sui blockchain...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Walrus Verification */}
              <VerificationCard
                title="Walrus Storage"
                icon="🗄️"
                status={blobVerification?.exists ? 'success' : 'error'}
                statusText={blobVerification?.exists ? 'Verified' : 'Not Found'}
              >
                {blobVerification?.exists ? (
                  <div className="space-y-3">
                    <Field label="Status" value="Blob exists and is retrievable" />
                    {blobVerification.size !== undefined && (
                      <Field label="Size" value={formatBytes(blobVerification.size)} />
                    )}
                    {blobVerification.contentType && (
                      <Field label="Content Type" value={blobVerification.contentType} />
                    )}
                    {blobVerification.etag && (
                      <Field label="ETag (Content Hash)" value={blobVerification.etag} mono />
                    )}
                    <div className="pt-3">
                      <a
                        href={getWalrusBlobUrl(decodedBlobId, AGGREGATOR_URL)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                      >
                        Open Raw Blob ↗
                      </a>
                      <a
                        href={`/proof/${encodeURIComponent(decodedBlobId)}${onChainRecord ? `?fileName=${encodeURIComponent(onChainRecord.fileName || '')}&owner=${encodeURIComponent(onChainRecord.owner)}&timestamp=${onChainRecord.timestamp}&versionId=${encodeURIComponent(onChainRecord.versionId)}&fileId=${encodeURIComponent(onChainRecord.fileId)}&mimeType=${encodeURIComponent(onChainRecord.mimeType || '')}` : ''}`}
                        className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition"
                      >
                        📜 Export Certificate
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">{error || 'This blob does not exist on Walrus testnet.'}</p>
                )}
              </VerificationCard>

              {/* On-Chain Verification */}
              <VerificationCard
                title="Sui Blockchain Record"
                icon="⛓️"
                status={onChainRecord ? 'success' : 'warning'}
                statusText={onChainRecord ? 'On-Chain Proof Found' : 'No SuiDrive Record'}
              >
                {onChainRecord ? (
                  <div className="space-y-3">
                    {onChainRecord.fileName && (
                      <Field label="File Name" value={onChainRecord.fileName} />
                    )}
                    {onChainRecord.mimeType && (
                      <Field label="MIME Type" value={onChainRecord.mimeType} />
                    )}
                    <Field
                      label="Owner"
                      value={truncateAddress(onChainRecord.owner, 10)}
                      mono
                      copyValue={onChainRecord.owner}
                    />
                    <Field label="Uploaded" value={formatDate(onChainRecord.timestamp)} />
                    <Field label="Version ID" value={onChainRecord.versionId} mono />
                    <Field label="File ID" value={onChainRecord.fileId} mono />
                    {onChainRecord.size > 0 && (
                      <Field label="Recorded Size" value={formatBytes(onChainRecord.size)} />
                    )}
                    {onChainRecord.aiSummary && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                        <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">
                          {onChainRecord.aiSummary}
                        </p>
                      </div>
                    )}
                    <div className="pt-3">
                      <Link
                        href={`/files/${encodeURIComponent(onChainRecord.fileId)}`}
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                      >
                        View Full Version History →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    This blob exists on Walrus but has no SuiDrive on-chain record.
                    It may have been uploaded outside SuiDrive or be from a different network.
                  </p>
                )}
              </VerificationCard>

              {/* Trust Summary */}
              {blobVerification?.exists && onChainRecord && (
                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/50 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">✅</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Authenticity Verified</h3>
                      <p className="text-gray-300 text-sm">
                        This file is cryptographically anchored to the Sui blockchain. The blob hash
                        matches the on-chain record, proving the file has not been tampered with since
                        it was uploaded by{' '}
                        <span className="font-mono">{truncateAddress(onChainRecord.owner)}</span> on{' '}
                        {formatDate(onChainRecord.timestamp)}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function VerificationCard({
  title,
  icon,
  status,
  statusText,
  children,
}: {
  title: string;
  icon: string;
  status: 'success' | 'error' | 'warning';
  statusText: string;
  children: React.ReactNode;
}) {
  const statusStyles = {
    success: 'bg-green-900/30 border-green-700 text-green-300',
    error: 'bg-red-900/30 border-red-700 text-red-300',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status]}`}>
          {statusText}
        </span>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  copyValue,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyValue || value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-xs text-gray-500 mt-0.5 shrink-0">{label}</p>
      <div className="flex items-center gap-2 min-w-0">
        <p className={`text-sm text-gray-200 truncate ${mono ? 'font-mono' : ''}`} title={value}>
          {value}
        </p>
        {(mono || copyValue) && (
          <button
            onClick={handleCopy}
            className="text-xs text-blue-400 hover:text-blue-300 shrink-0"
            title="Copy"
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
}
