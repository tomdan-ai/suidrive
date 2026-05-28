"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { WalletButton } from '@/components/WalletButton';
import { suiClientEnhanced } from '@/lib/sui/client';
import { walrusClient } from '@/lib/walrus/client';
import { generateFileId, generateVersionId, readFileAsText } from '@/lib/utils';
import type { UploadProgress } from '@/types';
import {
  Upload, Cloud, ShieldCheck, Zap,
  Cpu, HardDrive, FileCheck, ExternalLink,
  ChevronLeft, Loader2, Sparkles, Database
} from 'lucide-react';
import Link from 'next/link';

function UploadPageContent() {
  // --- BOSS'S LOGIC START ---
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const searchParams = useSearchParams();
 
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [existingFileId, setExistingFileId] = useState<string | null>(null);
  const [existingObjectId, setExistingObjectId] = useState<string | null>(null);
  const [versionNumber, setVersionNumber] = useState<number>(1);

  useEffect(() => {
    const fileIdParam = searchParams.get('fileId');
    const objectIdParam = searchParams.get('objectId');
    if (fileIdParam) {
      setExistingFileId(fileIdParam);
      if (objectIdParam) setExistingObjectId(objectIdParam);
      setVersionNumber(2);
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !account) return;
    setUploading(true);
    setProgress({ stage: 'uploading', progress: 10, message: 'Preparing protocol...' });

    try {
      const fileId = existingFileId || generateFileId();
      const versionId = generateVersionId(fileId, versionNumber);
      const isNewVersion = !!existingFileId;

      setProgress({ stage: 'uploading', progress: 30, message: 'Archiving to Walrus...' });
      const { blobId } = await walrusClient.uploadFile(file);

      setProgress({ stage: 'analyzing', progress: 50, message: 'Consulting NVIDIA NIM AI...' });
      let aiSummary = '';
      try {
        const fileContent = await readFileAsText(file);
        if (fileContent) {
          const analyzeResp = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, mimeType: file.type, fileContent }),
          });
          if (analyzeResp.ok) {
            const data = await analyzeResp.json();
            aiSummary = data.summary || '';
          }
        }
      } catch (e) { console.warn('AI failed', e); }

      if (!isNewVersion) {
        setProgress({ stage: 'blockchain', progress: 70, message: 'Minting Sui File Object...' });
        const fileTx = suiClientEnhanced.createFileTransaction(fileId, file.name, file.type);
        await new Promise<void>((res, rej) => {
          signAndExecute({ transaction: fileTx }, { onSuccess: () => res(), onError: (e) => rej(e) });
        });
      }

      setProgress({ stage: 'blockchain', progress: 85, message: 'Finalizing Immutable Version...' });
      const versionTx = suiClientEnhanced.createVersionTransaction(versionId, fileId, blobId, null, aiSummary, file.size);
      let txDigest = '';
      await new Promise<void>((res, rej) => {
        signAndExecute({ transaction: versionTx }, {
          onSuccess: (r) => { txDigest = r.digest; res(); },
          onError: (e) => rej(e)
        });
      });

      setProgress({ stage: 'complete', progress: 100, message: 'Protocol complete!' });
      setResult({ success: true, fileId, objectId: existingObjectId, versionId, blobId, transactionDigest: txDigest, aiSummary, isNewVersion, versionNumber });
    } catch (error) {
      console.error(error);
      setProgress(null);
    } finally {
      setUploading(false);
    }
  };
  // --- BOSS'S LOGIC END ---

  return (
    <div className="min-h-screen bg-[#01060b] text-white font-sans selection:bg-cyan-400 selection:text-black overflow-hidden relative flex flex-col">
     
      {/* 1. LAYER: CINEMATIC AMBIANCE */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* HEADER */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1600px] mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[3px]">Back to Universe</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <span className="text-black font-black text-xl italic">S</span>
          </div>
          <span className="text-2xl font-black tracking-tighter italic">SuiDrive</span>
        </div>
        <WalletButton />
      </nav>

      {/* MAIN CHAMBER */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
       
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-[60px] md:text-[80px] font-[1000] leading-none tracking-tighter uppercase italic">
            {existingFileId ? "NEW VERSION" : "PERMANENT"}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              ARCHIVE.
            </span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[4px] text-[10px]">
            {existingFileId ? `APPENDING VERSION ${versionNumber} ● SUI MAINNET` : "INITIATING IMMUTABLE FILE HISTORY PROTOCOL"}
          </p>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
         
          {/* UPLOAD CHAMBER */}
          <div className="lg:col-span-7 group relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="relative h-full bg-[#050b14]/90 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-cyan-400/30">
               
                {!account ? (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-cyan-400/10 rounded-3xl flex items-center justify-center border border-cyan-400/20">
                      <Zap size={40} className="text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-black uppercase italic">Protocol Locked</h3>
                    <p className="text-gray-500 text-xs max-w-[200px] mx-auto font-medium">Connect your Sui wallet to unlock decentralized storage.</p>
                    <WalletButton />
                  </div>
                ) : (
                  <div className="w-full space-y-10">
                    {/* DROPZONE */}
                    <div className="relative group/zone">
                      <input type="file" onChange={handleFileChange} className="hidden" id="file-input" disabled={uploading} />
                      <label htmlFor="file-input" className="block cursor-pointer">
                        <div className="relative border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center transition-all duration-500 group-hover/zone:border-cyan-400/40 bg-white/[0.01] group-hover/zone:bg-cyan-400/[0.02]">
                          {file ? (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-cyan-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <FileCheck className="text-cyan-400" size={32} />
                              </div>
                              <p className="text-white font-black uppercase italic tracking-tighter truncate max-w-[200px]">{file.name}</p>
                              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <Cloud size={48} className="text-gray-700 group-hover/zone:text-cyan-400 transition-colors mx-auto" />
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[4px]">Drop manifest here</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[4px] text-xs transition-all flex items-center justify-center gap-3 ${
                        !file || uploading
                        ? 'bg-white/5 text-gray-600 border border-white/5'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-400 text-black shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {uploading ? <><Loader2 className="animate-spin" size={18} /> Protocol in Progress</> : <><Zap size={18} fill="currentColor" /> Initialize Archive</>}
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* STATUS & AI CONSOLE */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* PROGRESS / RESULT CARD */}
             <div className="flex-1 bg-[#050b14]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-blue-600/10 rounded-lg">
                      <Cpu size={16} className="text-blue-400" />
                   </div>
                   <h4 className="text-[10px] font-bold uppercase tracking-[4px] text-gray-500">Live Console</h4>
                </div>

                {!progress && !result && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                    <Database size={40} className="mb-4" />
                    <p className="text-[8px] font-bold uppercase tracking-widest leading-loose">Waiting for<br />Input Signal...</p>
                  </div>
                )}

                {progress && !result && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase italic text-cyan-400">{progress.stage}</span>
                        <span className="text-2xl font-black font-mono italic">{progress.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500" style={{ width: `${progress.progress}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium italic border-l-2 border-cyan-400 pl-4">{progress.message}</p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
                      <div className="flex items-center gap-3 text-green-500 mb-4">
                        <ShieldCheck size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                      </div>
                      <div className="space-y-3 font-mono text-[9px] text-gray-400">
                        <p className="flex justify-between"><span>BLOB ID:</span> <span className="text-cyan-400">0x...{result.blobId.slice(-6)}</span></p>
                        <p className="flex justify-between"><span>SUI TX:</span> <span className="text-cyan-400">0x...{result.transactionDigest.slice(-6)}</span></p>
                      </div>
                    </div>

                    {result.aiSummary && (
                      <div className="p-6 bg-cyan-400/5 border border-cyan-400/10 rounded-2xl relative group overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 text-cyan-400 opacity-20" size={16} />
                        <h5 className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           NVIDIA NIM Analysis
                        </h5>
                        <p className="text-[11px] text-gray-300 leading-relaxed italic">{result.aiSummary}</p>
                      </div>
                    )}

                    <a
                      href={`https://suiexplorer.com/txblock/${result.transactionDigest}?network=testnet`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      View Onchain Proof <ExternalLink size={10} />
                    </a>
                  </div>
                )}
             </div>

             {/* SIDE TECH TILES */}
             <div className="grid grid-cols-3 gap-4">
               <TechTile icon={<HardDrive size={16} />} label="Walrus" />
               <TechTile icon={<Zap size={16} />} label="Sui" />
               <TechTile icon={<Sparkles size={16} />} label="NIM" />
             </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function TechTile({ icon, label }: any) {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/[0.05] transition-all cursor-crosshair group">
       <div className="text-gray-600 group-hover:text-cyan-400 transition-colors">{icon}</div>
       <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#01060b] flex items-center justify-center font-mono text-[10px] uppercase tracking-[10px] animate-pulse text-cyan-400">Syncing...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}