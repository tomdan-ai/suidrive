"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFileHistory } from '@/hooks/useFileHistory';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { ShareDialog } from '@/components/ShareDialog';
import { formatDate, formatBytes } from '@/lib/utils';
import type { TimelineVersion } from '@/types';
import {
  ChevronLeft, History, ShieldCheck, Zap,
  Download, ExternalLink, Sparkles, Clock,
  FileText, Database, Layers, Share2, ArrowLeft,
  Lock, AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function FileDetailPage({ params }: { params: Promise<{ fileId: string }> }) {
  // --- BOSS'S LOGIC START ---
  const { fileId } = React.use(params);
  const { fileHistory, loading, error } = useFileHistory(fileId);
  const { address } = useZkLogin();
  const [selectedVersion, setSelectedVersion] = useState<TimelineVersion | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const router = useRouter();

  const latestVersion = fileHistory?.versions && fileHistory.versions.length > 0
    ? fileHistory.versions[fileHistory.versions.length - 1]
    : null;

  const isEncrypted = fileHistory?.versions.some((v) => v.summary?.includes('[enc:salt=')) || false;
  // --- BOSS'S LOGIC END ---

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/40 font-medium text-sm">Loading file history...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !fileHistory) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">File Not Found</h1>
        <p className="text-white/40 mb-8 max-w-sm">We couldn&apos;t find the requested file. It may not exist or you might not have access to it.</p>
        <Link href="/dashboard" className="btn-watery px-6 py-2 text-white rounded-xl font-semibold text-sm">
          Back to Drive
        </Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: FILE INFO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20">
                <FileText size={32} className="text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-6 break-words leading-tight">
                {fileHistory.file.name || 'Unnamed File'}
              </h1>

              <div className="space-y-4">
                <InfoBlock label="Owner" value={fileHistory.file.owner} mono />
                <InfoBlock label="File ID" value={fileHistory.file.fileId} mono />
                <InfoBlock label="Type" value={fileHistory.file.mimeType || 'Unknown'} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoBlock label="Created" value={formatDate(fileHistory.file.createdAt)} />
                  <InfoBlock label="Versions" value={fileHistory.versions.length} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
                {latestVersion && (
                  <a
                    href={`/api/download?blobId=${latestVersion.blobId}&fileName=${encodeURIComponent(fileHistory.file.name || latestVersion.blobId)}`}
                    download
                    className="w-full py-2.5 btn-watery rounded-xl font-semibold text-sm text-center text-white flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download
                  </a>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/upload?fileId=${fileHistory.file.fileId}&objectId=${fileHistory.file.objectId || ''}`}
                    className="w-full py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-medium text-sm text-center hover:bg-white/10 transition-colors"
                  >
                    Update
                  </Link>
                  <button
                    onClick={() => setShareOpen(true)}
                    className="w-full py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-medium text-sm text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TIMELINE */}
          <div className="lg:col-span-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Version History</h2>
              <p className="text-sm text-white/40 mt-1">Select a version to preview and inspect details.</p>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {fileHistory.versions.map((v: any, index: number) => {
                  const isSelected = selectedVersion?.version === v.version;

                  return (
                    <div key={v.versionId} className="group">
                      <div
                        onClick={() => setSelectedVersion(v)}
                        className={`p-5 cursor-pointer transition-all flex items-start gap-4 ${isSelected ? 'bg-cyan-500/5' : 'hover:bg-white/[0.03]'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold transition-all ${isSelected ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,207,255,0.3)]' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                          {v.version}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-400' : 'text-white/70'}`}>Version {v.version}</span>
                            <span className="text-xs text-white/30 flex items-center gap-1.5"><Clock size={12}/> {formatDate(v.timestamp)}</span>
                          </div>
                          <div className="text-xs font-mono text-white/30 truncate mb-1">BLOB: {v.blobId}</div>
                        </div>
                      </div>

                      {/* Expandable Details Area */}
                      {isSelected && (
                        <div className="px-5 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 ml-12 border-t border-transparent">

                          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 mb-4">
                            <FilePreview blobId={v.blobId} mimeType={fileHistory.file.mimeType} fileName={fileHistory.file.name} summary={v.summary} />
                          </div>

                          {v.summary && !v.summary.includes('[enc:salt=') && (
                            <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/10 mb-4 relative">
                              <Sparkles className="absolute top-4 right-4 text-cyan-400 opacity-20" size={24} />
                              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">AI Summary</h4>
                              <p className="text-sm text-white/60 leading-relaxed">{v.summary}</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <a href={`https://suiexplorer.com/object/${v.versionId}?network=testnet`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/50 text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                              <ExternalLink size={14} /> Explorer
                            </a>
                            <Link href={`/verify/${encodeURIComponent(v.blobId)}`} className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/50 text-center hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-400" /> Verify
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {fileHistory && latestVersion && (
        <ShareDialog
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          blobId={latestVersion.blobId}
          fileName={fileHistory.file.name || 'Unnamed File'}
          isEncrypted={isEncrypted}
          ownerAddress={fileHistory.file.owner}
        />
      )}
    </DashboardLayout>
  );
}

function InfoBlock({ label, value, mono }: any) {
  return (
    <div>
      <p className="text-xs font-medium text-white/30 mb-1">{label}</p>
      <p className={`text-sm text-white/70 ${mono ? 'font-mono text-xs break-all' : 'font-medium break-words'}`}>
        {value}
      </p>
    </div>
  );
}

function FilePreview({ blobId, mimeType, fileName, summary }: { blobId: string; mimeType?: string; fileName?: string; summary?: string }) {
  const [textContent, setTextContent] = React.useState<string | null>(null);
  const [decryptedUrl, setDecryptedUrl] = React.useState<string | null>(null);
  const [decrypting, setDecrypting] = React.useState(false);
  const [decryptError, setDecryptError] = React.useState<string | null>(null);

  const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
  const walrusUrl = `${aggregatorUrl}/v1/blobs/${blobId}`;

  // Detect encryption from summary metadata: [enc:salt=HEXHEX]
  const encMatch = summary?.match(/\[enc:salt=([a-f0-9]+)\]/i);
  const isEncrypted = !!encMatch;
  const encSalt = encMatch?.[1] || '';

  if (isEncrypted && !decryptedUrl) {
    return (
      <div className="text-center py-6">
        <Lock size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm font-semibold text-white mb-2">Encrypted File</p>
        <p className="text-xs text-white/40 max-w-xs mx-auto mb-4">
          This file was encrypted before upload. Only the owner can decrypt it.
        </p>
        {decryptError && (
          <p className="text-xs text-red-400 mb-4">{decryptError}</p>
        )}
        <button
          onClick={async () => {
            setDecrypting(true);
            setDecryptError(null);
            try {
              const { decryptWalrusBlob } = await import('@/lib/crypto/encryption');
              const accountData = localStorage.getItem('suidrive_zklogin_account');
              let walletAddress = '';
              if (accountData) {
                try {
                  const parsed = JSON.parse(accountData);
                  walletAddress = parsed.address || '';
                } catch {}
              }
              if (!walletAddress) {
                throw new Error('Sign in to decrypt');
              }
              const decrypted = await decryptWalrusBlob(blobId, walletAddress, encSalt);
              const blob = new Blob([decrypted], { type: mimeType || 'application/octet-stream' });
              const url = URL.createObjectURL(blob);
              setDecryptedUrl(url);
            } catch (err) {
              setDecryptError(err instanceof Error ? err.message : 'Decryption failed');
            } finally {
              setDecrypting(false);
            }
          }}
          disabled={decrypting}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          {decrypting ? 'Decrypting...' : 'Unlock Preview'}
        </button>
      </div>
    );
  }

  const displayUrl = decryptedUrl || walrusUrl;

  if (mimeType?.startsWith('image/')) {
    return (
      <div className="flex justify-center">
        <img src={displayUrl} alt={fileName} className="max-w-full max-h-64 rounded-lg object-contain" />
      </div>
    );
  }
  if (mimeType?.startsWith('video/')) {
    return (
      <div>
        <video controls className="w-full max-h-64 rounded-lg">
          <source src={displayUrl} type={mimeType} />
        </video>
      </div>
    );
  }
  if (mimeType === 'application/pdf') {
    return <iframe src={displayUrl} className="w-full h-80 rounded-lg bg-white/5 border border-white/5" />;
  }
  if (mimeType?.startsWith('text/') || mimeType === 'application/json') {
    if (textContent === null) {
      fetch(displayUrl).then(r => r.text()).then(t => setTextContent(t.slice(0, 4000)));
    }
    return (
      <div className="max-h-64 overflow-auto bg-white/[0.03] border border-white/5 rounded-lg p-4 text-xs font-mono text-white/60">
        <pre className="whitespace-pre-wrap">{textContent ?? 'Loading...'}</pre>
      </div>
    );
  }
  return (
    <div className="text-center py-6 text-white/30 text-sm">
      <FileText size={32} className="text-white/10 mx-auto mb-2" />
      No preview available for this file type
    </div>
  );
}
