"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { AuthOptions } from '@/components/AuthButton';
import { walrusClient } from '@/lib/walrus/client';
import { encryptFile } from '@/lib/crypto/encryption';
import { generateFileId, generateVersionId, readFileAsText } from '@/lib/utils';
import type { UploadProgress } from '@/types';
import {
  Cloud, ShieldCheck, Zap,
  Cpu, HardDrive, FileCheck, ExternalLink,
  ChevronLeft, Loader2, Sparkles, Database, Lock, LockOpen, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function UploadPageContent() {
  // --- BOSS'S LOGIC START ---
  const { account, address } = useZkLogin();
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<any>(null);
  const [existingFileId, setExistingFileId] = useState<string | null>(null);
  const [existingObjectId, setExistingObjectId] = useState<string | null>(null);
  const [versionNumber, setVersionNumber] = useState<number>(1);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

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
    if (!file || !address) return;
    setUploading(true);
    setProgress({ stage: 'uploading', progress: 10, message: 'Preparing upload...' });

    try {
      const fileId = existingFileId || generateFileId();
      const versionId = generateVersionId(fileId, versionNumber);
      const isNewVersion = !!existingFileId;

      // --- Encryption step (optional) ---
      let uploadPayload: File | Blob = file;
      let encryptionSalt: string | null = null;

      if (encryptionEnabled) {
        setProgress({ stage: 'uploading', progress: 20, message: 'Encrypting locally (AES-256-GCM)...' });
        const { encryptedBlob, salt } = await encryptFile(file, address);
        uploadPayload = new File([encryptedBlob], file.name + '.encrypted', { type: 'application/octet-stream' });
        encryptionSalt = salt;
      }

      setProgress({ stage: 'uploading', progress: 30, message: 'Uploading to Walrus...' });
      const { blobId } = await walrusClient.uploadFile(uploadPayload as File);

      setProgress({ stage: 'analyzing', progress: 50, message: 'Analyzing with AI...' });
      let aiSummary = '';
      try {
        if (!encryptionEnabled) {
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
        } else {
          aiSummary = `[Encrypted] File encrypted with AES-256-GCM before upload. Original: ${file.name} (${file.type}, ${file.size} bytes).`;
        }
      } catch (e) { console.warn('AI failed', e); }

      let createdFileObjectId = existingObjectId || '';

      if (!isNewVersion) {
        setProgress({ stage: 'blockchain', progress: 70, message: 'Creating File Record on Sui...' });
        const fileRes = await fetch('/api/chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createFile',
            fileId,
            name: file.name,
            mimeType: file.type,
            ownerAddress: address,
          }),
        });
        if (!fileRes.ok) {
          const err = await fileRes.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create file on-chain');
        }
        const fileData = await fileRes.json();
        // Extract the created FileObject ID from objectChanges
        const fileObj = fileData.objectChanges?.find(
          (c: any) => c.type === 'created' && c.objectType?.includes('file_object::FileObject')
        );
        if (fileObj) {
          createdFileObjectId = fileObj.objectId;
        }
      }

      setProgress({ stage: 'blockchain', progress: 85, message: 'Finalizing Version on Sui...' });
      const summaryWithMeta = encryptionSalt
        ? `${aiSummary} [enc:salt=${encryptionSalt}]`
        : aiSummary;

      const versionRes = await fetch('/api/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createVersion',
          versionId,
          fileId,
          walrusBlobId: blobId,
          previousVersion: null,
          aiSummary: summaryWithMeta,
          size: file.size,
          ownerAddress: address,
        }),
      });
      if (!versionRes.ok) {
        const err = await versionRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create version on-chain');
      }
      const versionData = await versionRes.json();
      const txDigest = versionData.digest || '';

      setProgress({ stage: 'complete', progress: 100, message: 'Upload complete!' });
      setResult({
        success: true, fileId, objectId: createdFileObjectId || existingObjectId, versionId, blobId,
        transactionDigest: txDigest, aiSummary, isNewVersion, versionNumber,
        encrypted: encryptionEnabled, encryptionSalt,
      });
    } catch (error) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errMsg.includes('Failed to fetch') || errMsg.includes('Walrus') || errMsg.includes('SSL') || errMsg.includes('network')) {
        setProgress({ stage: 'uploading', progress: 0, message: '⚠️ Storage network unavailable. Walrus testnet may be experiencing issues. Please try again later.' });
      } else if (errMsg.includes('Sponsor') || errMsg.includes('gas')) {
        setProgress({ stage: 'blockchain', progress: 0, message: '⚠️ Transaction sponsorship failed. The gas sponsor may be out of funds.' });
      } else if (errMsg.includes('Not authenticated') || errMsg.includes('sign in')) {
        setProgress({ stage: 'blockchain', progress: 0, message: '⚠️ Session expired. Please sign in again.' });
      } else {
        setProgress({ stage: 'uploading', progress: 0, message: `⚠️ ${errMsg}` });
      }
    } finally {
      setUploading(false);
    }
  };
  // --- BOSS'S LOGIC END ---

  return (
    <div className="min-h-screen bg-[#02060f] text-white font-sans flex flex-col items-center pt-8 px-4 pb-20 relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,180,216,0.06)_0%,transparent_65%)] animate-watery-1" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,119,182,0.05)_0%,transparent_65%)] animate-watery-2" />
      </div>

      <div className="w-full max-w-2xl mb-6 relative z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-medium text-sm w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 md:p-12 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            {existingFileId ? "Upload New Version" : "Upload to Drive"}
          </h1>
          <p className="text-white/40 text-sm">
            {existingFileId ? `Appending Version ${versionNumber}` : "Files are stored permanently on Walrus"}
          </p>
        </div>

        {!address ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 animate-glow">
              <ShieldCheck size={32} className="text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sign in Required</h3>
            <p className="text-white/40 text-sm mb-8">Please sign in to upload files.</p>
            <AuthOptions />
          </div>
        ) : (
          <div className="space-y-6">

            {/* DROPZONE */}
            <div className="relative">
              <input type="file" onChange={handleFileChange} className="hidden" id="file-input" disabled={uploading} />
              <label htmlFor="file-input" className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.02] bg-transparent'}`}>
                  {file ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-500/20">
                        <FileCheck className="text-cyan-400" size={24} />
                      </div>
                      <p className="text-white font-medium truncate max-w-xs mx-auto">{file.name}</p>
                      <p className="text-sm text-white/40 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Cloud size={40} className="text-white/20 mx-auto mb-3" />
                      <p className="text-white/70 font-medium mb-1">Click or drag file to this area to upload</p>
                      <p className="text-sm text-white/30">Supports single file upload</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* ENCRYPTION TOGGLE */}
            <label className="flex items-center gap-3 p-4 glass-panel rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all select-none">
              <input
                type="checkbox"
                checked={encryptionEnabled}
                onChange={(e) => setEncryptionEnabled(e.target.checked)}
                disabled={uploading}
                className="w-4 h-4 text-cyan-500 rounded border-white/20 bg-white/5 focus:ring-cyan-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Lock size={14} className={encryptionEnabled ? "text-cyan-400" : "text-white/30"} />
                  Encrypt file before upload
                </p>
                <p className="text-xs text-white/30 mt-1">Your file will be encrypted using your wallet address. Only you can decrypt it.</p>
              </div>
            </label>

            {/* UPLOAD BUTTON */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || !!result}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                !file || uploading || !!result
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                : 'btn-watery text-white'
              }`}
            >
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Cloud size={18} /> Upload File</>}
            </button>

            {/* PROGRESS BAR */}
            {progress && !result && (
              <div className="mt-6 p-4 glass-panel rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white/70">{progress.stage === 'uploading' ? 'Uploading' : 'Processing'}</span>
                  <span className="text-sm font-bold text-cyan-400">{progress.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full" style={{ width: `${progress.progress}%` }} />
                </div>
                <p className="text-xs text-white/40">{progress.message}</p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {result && (
              <div className="mt-6 p-5 glass-panel rounded-xl border-emerald-500/20 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                {/* Success glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3">
                    <ShieldCheck size={20} />
                    Upload Successful
                  </div>

                  <div className="space-y-2 mb-4 text-xs text-white/50 font-mono bg-white/[0.03] p-3 rounded-lg border border-white/5">
                    <p className="flex justify-between"><span className="text-white/30">Blob ID:</span> <span className="truncate ml-4">{result.blobId}</span></p>
                    <p className="flex justify-between"><span className="text-white/30">Sui TX:</span> <span className="truncate ml-4">{result.transactionDigest}</span></p>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/files/${result.objectId || result.fileId}`} className="flex-1 text-center py-2 btn-watery rounded-lg text-sm font-semibold text-white">
                      View File
                    </Link>
                    <Link href="/dashboard" className="flex-1 text-center py-2 bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                      Back to Drive
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#02060f] flex items-center justify-center font-medium text-white/40 text-sm">Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}