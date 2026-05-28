"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFileHistory } from '@/hooks/useFileHistory';
import { WalletButton } from '@/components/WalletButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { TimelineVersion } from '@/types';
import {
  ChevronLeft, History, ShieldCheck, Zap,
  Download, ExternalLink, Sparkles, Clock,
  FileText, Database, Layers
} from 'lucide-react';

export default function FileDetailPage({ params }: { params: Promise<{ fileId: string }> }) {
  // --- BOSS'S LOGIC START ---
  const { fileId } = React.use(params);
  const { fileHistory, loading, error } = useFileHistory(fileId);
  const [selectedVersion, setSelectedVersion] = useState<TimelineVersion | null>(null);

  const latestVersion = fileHistory?.versions && fileHistory.versions.length > 0
    ? fileHistory.versions[fileHistory.versions.length - 1]
    : null;
  // --- BOSS'S LOGIC END ---

  if (loading) return (
    <div className="min-h-screen bg-[#01060b] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-[5px]">Reconstructing History...</p>
    </div>
  );

  if (error || !fileHistory) return (
    <div className="min-h-screen bg-[#01060b] text-white flex flex-col items-center justify-center p-10">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-4xl font-black italic uppercase mb-4">Archive Not Found</h1>
      <Link href="/dashboard" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all">
        Back to Universe
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#01060b] text-white font-sans selection:bg-cyan-400 overflow-x-hidden relative flex flex-col">
     
      {/* CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1600px] mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[3px]">Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Layers className="text-cyan-400" size={24} />
          <span className="text-2xl font-black tracking-tighter italic uppercase">Version Timeline</span>
        </div>
        <WalletButton />
      </nav>

      <main className="relative z-10 max-w-[1600px] mx-auto w-full px-10 grid lg:grid-cols-12 gap-12 pb-20">
       
        {/* LEFT: HOLOGRAPHIC FILE INFO */}
        <div className="lg:col-span-4">
          <div className="bg-[#050b14]/90 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 sticky top-10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
            <h1 className="text-3xl font-black italic uppercase mb-8 break-words text-white/90 leading-tight">
              {fileHistory.file.name || 'Unnamed Archive'}
            </h1>

            <div className="space-y-6 relative z-10">
              <InfoBlock label="Protocol ID" value={fileHistory.file.fileId} mono />
              <InfoBlock label="Mime Type" value={fileHistory.file.mimeType || 'Unknown'} />
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Created" value={formatDate(fileHistory.file.createdAt)} />
                <InfoBlock label="Total Versions" value={fileHistory.versions.length} />
              </div>
              <InfoBlock label="Sui Owner" value={fileHistory.file.owner} mono small />
            </div>

            <div className="mt-10 space-y-3 relative z-10">
              {latestVersion && (
                <a
                  href={`/api/download?blobId=${latestVersion.blobId}&fileName=${encodeURIComponent(fileHistory.file.name || latestVersion.blobId)}`}
                  download
                  className="block w-full py-4 bg-cyan-400 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:scale-[1.02] transition shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                >
                  Download Latest
                </a>
              )}
              <Link
                href={`/upload?fileId=${fileHistory.file.fileId}&objectId=${fileHistory.file.objectId || ''}`}
                className="block w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-white/10 transition"
              >
                Upload New Version
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: THE TIMELINE RIBBON */}
        <div className="lg:col-span-8">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[1000] italic uppercase italic">History Log</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">Select a version to inspect data</p>
            </div>
          </div>

          <div className="relative border-l-2 border-white/5 ml-4 space-y-10">
            {fileHistory.versions.map((v: any, index: number) => (
              <div key={v.versionId} className="relative pl-12 group">
                {/* Timeline Dot */}
                <div className={`absolute left-[-9px] top-4 w-4 h-4 rounded-full border-2 border-[#01060b] transition-all duration-500 ${selectedVersion?.version === v.version ? 'bg-cyan-400 shadow-[0_0_20px_#00F0FF] scale-125' : 'bg-gray-800 group-hover:bg-cyan-900'}`} />
               
                <div
                  onClick={() => setSelectedVersion(v)}
                  className={`cursor-pointer bg-white/[0.02] border rounded-[32px] p-8 transition-all duration-500 ${selectedVersion?.version === v.version ? 'border-cyan-400/50 bg-cyan-400/[0.03]' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-black italic text-white/10 group-hover:text-cyan-400/20 transition-colors">#{v.version}</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-400/10 rounded-full">
                        <Clock size={12} className="text-cyan-400" />
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{formatDate(v.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <span className="text-[8px] font-mono text-gray-600 uppercase">BLOB: {v.blobId.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Expandable Details Area */}
                  {selectedVersion?.version === v.version && (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-top-4">
                      {v.summary && (
                        <div className="bg-[#01060b] p-6 rounded-2xl border border-cyan-400/20 relative">
                          <Sparkles className="absolute top-4 right-4 text-cyan-400 opacity-20" size={16} />
                          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-3">AI Intelligence Report</p>
                          <p className="text-sm text-gray-300 leading-relaxed italic">{v.summary}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Protocol Preview</p>
                         <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                            <FilePreview blobId={v.blobId} mimeType={fileHistory.file.mimeType} fileName={fileHistory.file.name} />
                         </div>
                      </div>

                      <div className="flex gap-4">
                        <a href={`https://suiexplorer.com/object/${v.versionId}?network=testnet`} target="_blank" className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-center hover:bg-white/10 transition flex items-center justify-center gap-2">
                          Explore Transaction <ExternalLink size={12} />
                        </a>
                        <Link href={`/verify/${encodeURIComponent(v.blobId)}`} className="flex-1 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-[10px] font-black uppercase text-center text-green-500 hover:bg-green-500/20 transition flex items-center justify-center gap-2">
                          Verify Blob <ShieldCheck size={12} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoBlock({ label, value, mono, small }: any) {
  return (
    <div>
      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[3px] mb-1.5">{label}</p>
      <p className={`${mono ? 'font-mono' : 'font-black italic'} ${small ? 'text-[10px]' : 'text-sm'} text-white/80 break-all leading-tight uppercase`}>{value}</p>
    </div>
  );
}

// RESTORED BOSS'S PREVIEW COMPONENT
function FilePreview({ blobId, mimeType, fileName }: { blobId: string; mimeType?: string; fileName?: string }) {
  const [textContent, setTextContent] = React.useState<string | null>(null);
  const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
  const walrusUrl = `${aggregatorUrl}/v1/blobs/${blobId}`;

  if (mimeType?.startsWith('image/')) return (
    <div className="p-4 flex justify-center bg-white/[0.02]"><img src={walrusUrl} alt={fileName} className="max-w-full max-h-96 rounded-xl shadow-2xl" /></div>
  );
  if (mimeType?.startsWith('video/')) return (
    <div className="p-4"><video controls className="w-full rounded-xl"><source src={walrusUrl} type={mimeType} /></video></div>
  );
  if (mimeType === 'application/pdf') return (
    <iframe src={walrusUrl} className="w-full h-96 bg-white" />
  );
  if (mimeType?.startsWith('text/') || mimeType === 'application/json') {
    if (textContent === null) fetch(walrusUrl).then(r => r.text()).then(t => setTextContent(t.slice(0, 4000)));
    return (
      <div className="p-6 max-h-64 overflow-auto bg-[#01060b] font-mono text-[11px] text-cyan-400/80 leading-relaxed">
        <pre className="whitespace-pre-wrap">{textContent ?? 'Decoding Binary...'}</pre>
      </div>
    );
  }
  return <div className="p-10 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">Preview Protocol Unavailable</div>;
}