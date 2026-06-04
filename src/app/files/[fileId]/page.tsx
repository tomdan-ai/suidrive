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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Loading file history...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !fileHistory) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">File Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-sm">We couldn't find the requested file. It may not exist or you might not have access to it.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
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
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: FILE INFO */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <FileText size={32} className="text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-6 break-words leading-tight">
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

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                {latestVersion && (
                  <a
                    href={`/api/download?blobId=${latestVersion.blobId}&fileName=${encodeURIComponent(fileHistory.file.name || latestVersion.blobId)}`}
                    download
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm text-center hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Download
                  </a>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/upload?fileId=${fileHistory.file.fileId}&objectId=${fileHistory.file.objectId || ''}`}
                    className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm text-center hover:bg-slate-50 transition-colors"
                  >
                    Update
                  </Link>
                  <button
                    onClick={() => setShareOpen(true)}
                    className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
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
              <h2 className="text-xl font-semibold text-slate-800">Version History</h2>
              <p className="text-sm text-slate-500 mt-1">Select a version to preview and inspect details.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {fileHistory.versions.map((v: any, index: number) => {
                  const isSelected = selectedVersion?.version === v.version;
                  
                  return (
                    <div key={v.versionId} className="group">
                      <div 
                        onClick={() => setSelectedVersion(v)}
                        className={`p-5 cursor-pointer transition-colors flex items-start gap-4 ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                          {v.version}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>Version {v.version}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12}/> {formatDate(v.timestamp)}</span>
                          </div>
                          <div className="text-xs font-mono text-slate-500 truncate mb-1">BLOB: {v.blobId}</div>
                        </div>
                      </div>

                      {/* Expandable Details Area */}
                      {isSelected && (
                        <div className="px-5 pb-5 pt-2 animate-in fade-in slide-in-from-top-2 ml-12 border-t border-transparent">
                          
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
                            <FilePreview blobId={v.blobId} mimeType={fileHistory.file.mimeType} fileName={fileHistory.file.name} summary={v.summary} />
                          </div>

                          {v.summary && !v.summary.includes('[enc:salt=') && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 relative">
                              <Sparkles className="absolute top-4 right-4 text-blue-400 opacity-20" size={24} />
                              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">AI Summary</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{v.summary}</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <a href={`https://suiexplorer.com/object/${v.versionId}?network=testnet`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                              <ExternalLink size={14} /> Explorer
                            </a>
                            <Link href={`/verify/${encodeURIComponent(v.blobId)}`} className="flex-1 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                              <ShieldCheck size={14} className="text-green-600" /> Verify
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
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-sm text-slate-800 ${mono ? 'font-mono text-xs break-all' : 'font-medium break-words'}`}>
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
        <Lock size={32} className="text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800 mb-2">Encrypted File</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
          This file was encrypted before upload. Only the owner can decrypt it.
        </p>
        {decryptError && (
          <p className="text-xs text-red-500 mb-4">{decryptError}</p>
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
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2"
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
    return <iframe src={displayUrl} className="w-full h-80 rounded-lg bg-white border border-slate-200" />;
  }
  if (mimeType?.startsWith('text/') || mimeType === 'application/json') {
    if (textContent === null) {
      fetch(displayUrl).then(r => r.text()).then(t => setTextContent(t.slice(0, 4000)));
    }
    return (
      <div className="max-h-64 overflow-auto bg-white border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-700">
        <pre className="whitespace-pre-wrap">{textContent ?? 'Loading...'}</pre>
      </div>
    );
  }
  return (
    <div className="text-center py-6 text-slate-500 text-sm">
      <FileText size={32} className="text-slate-300 mx-auto mb-2" />
      No preview available for this file type
    </div>
  );
}
