"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { AuthOptions } from '@/components/AuthButton';
import { suiClientEnhanced } from '@/lib/sui/client';
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

function UploadPageContent() {
  // --- BOSS'S LOGIC START ---
  const { account, address, signAndExecuteTransaction } = useZkLogin();
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

      if (!isNewVersion) {
        setProgress({ stage: 'blockchain', progress: 70, message: 'Creating File Record on Sui...' });
        const fileTx = suiClientEnhanced.createFileTransaction(fileId, file.name, file.type);
        await new Promise<void>((res, rej) => {
          signAndExecuteTransaction({ transaction: fileTx, onSuccess: () => res(), onError: (e) => rej(e) });
        });
      }

      setProgress({ stage: 'blockchain', progress: 85, message: 'Finalizing Version on Sui...' });
      const summaryWithMeta = encryptionSalt
        ? `${aiSummary} [enc:salt=${encryptionSalt}]`
        : aiSummary;

      const versionTx = suiClientEnhanced.createVersionTransaction(versionId, fileId, blobId, null, summaryWithMeta, file.size);
      let txDigest = '';
      await new Promise<void>((res, rej) => {
        signAndExecuteTransaction({ transaction: versionTx,
          onSuccess: (r) => { txDigest = r.digest; res(); },
          onError: (e) => rej(e)
        });
      });

      setProgress({ stage: 'complete', progress: 100, message: 'Upload complete!' });
      setResult({
        success: true, fileId, objectId: existingObjectId, versionId, blobId,
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col items-center pt-8 px-4 pb-20">
      
      <div className="w-full max-w-2xl mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm w-fit"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {existingFileId ? "Upload New Version" : "Upload to Drive"}
          </h1>
          <p className="text-slate-500 text-sm">
            {existingFileId ? `Appending Version ${versionNumber}` : "Files are stored permanently on Walrus"}
          </p>
        </div>

        {!address ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
               <ShieldCheck size={32} className="text-blue-600" />
             </div>
             <h3 className="text-xl font-semibold text-slate-800 mb-2">Sign in Required</h3>
             <p className="text-slate-500 text-sm mb-8">Please sign in to upload files.</p>
             <AuthOptions />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* DROPZONE */}
            <div className="relative">
              <input type="file" onChange={handleFileChange} className="hidden" id="file-input" disabled={uploading} />
              <label htmlFor="file-input" className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${file ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 bg-white'}`}>
                  {file ? (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileCheck className="text-blue-600" size={24} />
                      </div>
                      <p className="text-slate-800 font-medium truncate max-w-xs mx-auto">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Cloud size={40} className="text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium mb-1">Click or drag file to this area to upload</p>
                      <p className="text-sm text-slate-500">Supports single file upload</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* ENCRYPTION TOGGLE */}
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors select-none">
              <input 
                type="checkbox" 
                checked={encryptionEnabled}
                onChange={(e) => setEncryptionEnabled(e.target.checked)}
                disabled={uploading}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <Lock size={14} className={encryptionEnabled ? "text-blue-600" : "text-slate-400"} />
                  Encrypt file before upload
                </p>
                <p className="text-xs text-slate-500 mt-1">Your file will be encrypted using your wallet address. Only you can decrypt it.</p>
              </div>
            </label>

            {/* UPLOAD BUTTON */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || !!result}
              className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                !file || uploading || !!result
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Cloud size={18} /> Upload File</>}
            </button>

            {/* PROGRESS BAR */}
            {progress && !result && (
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">{progress.stage === 'uploading' ? 'Uploading' : 'Processing'}</span>
                  <span className="text-sm font-medium text-blue-600">{progress.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress.progress}%` }} />
                </div>
                <p className="text-xs text-slate-500">{progress.message}</p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {result && (
              <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                  <ShieldCheck size={20} />
                  Upload Successful
                </div>
                
                <div className="space-y-2 mb-4 text-xs text-slate-600 font-mono bg-white p-3 rounded border border-green-100">
                   <p className="flex justify-between"><span className="text-slate-400">Blob ID:</span> <span className="truncate ml-4">{result.blobId}</span></p>
                   <p className="flex justify-between"><span className="text-slate-400">Sui TX:</span> <span className="truncate ml-4">{result.transactionDigest}</span></p>
                </div>

                <div className="flex gap-3">
                  <Link href={`/files/${result.objectId || result.fileId}`} className="flex-1 text-center py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    View File
                  </Link>
                  <Link href="/dashboard" className="flex-1 text-center py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors">
                    Back to Drive
                  </Link>
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
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-medium text-slate-500 text-sm">Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}