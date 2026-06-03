/**
 * Proof Certificate Page
 * Renders a printable/downloadable proof of file ownership & integrity
 * Users can "Print to PDF" from the browser to save a permanent certificate
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatBytes } from '@/lib/utils';

interface ProofData {
  '@context': string;
  type: string;
  schemaVersion: string;
  generated: string;
  network: string;
  file: {
    fileId: string | null;
    fileName: string | null;
    mimeType: string | null;
    owner: string | null;
  };
  version: {
    versionId: string | null;
    timestamp: string | null;
    timestampMs: number | null;
    size: number;
    aiSummary: string | null;
  };
  storage: {
    provider: string;
    network: string;
    blobId: string;
    retrievalUrl: string;
    verified: boolean;
    verifiedAt: string | null;
    verifiedSize: number;
    contentType: string | null;
  };
  blockchain: {
    chain: string;
    network: string;
    packageId: string | null;
    explorerUrl: string | null;
  };
  verification: {
    publicVerifyUrl: string;
    shareUrl: string;
    integrity: string;
  };
}

export default function ProofCertificatePage({ params }: { params: Promise<{ blobId: string }> }) {
  const { blobId } = React.use(params);
  const decodedBlobId = decodeURIComponent(blobId);

  const [proof, setProof] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get additional params from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const url = `/api/proof?blobId=${encodeURIComponent(decodedBlobId)}${queryString ? '&' + queryString : ''}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setProof(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [decodedBlobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Generating certificate...</p>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">Failed to generate proof certificate</p>
      </div>
    );
  }

  const handlePrint = () => window.print();
  const handleDownloadJson = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('format', 'download');
    window.open(`/api/proof?blobId=${encodeURIComponent(decodedBlobId)}&${searchParams.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action bar (hidden when printing) */}
      <div className="print:hidden sticky top-0 z-50 bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <Link href="/verify" className="text-gray-400 hover:text-white text-sm">
          ← Back to Verify
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadJson}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
          >
            ⬇ Download JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
          >
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate Document */}
      <div className="max-w-[800px] mx-auto my-8 print:my-0 bg-white shadow-xl print:shadow-none">
        <div className="p-12 print:p-8">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-900 pb-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              PROOF OF FILE INTEGRITY
            </h1>
            <h2 className="text-lg text-gray-600 font-medium">SuiDrive Certificate</h2>
            <p className="text-sm text-gray-400 mt-2">
              Generated: {new Date(proof.generated).toLocaleString()}
            </p>
          </div>

          {/* Status Banner */}
          <div className={`p-4 rounded-lg mb-8 text-center ${
            proof.storage.verified
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-lg font-bold ${proof.storage.verified ? 'text-green-700' : 'text-red-700'}`}>
              {proof.storage.verified ? '✓ INTEGRITY VERIFIED' : '✗ VERIFICATION FAILED'}
            </p>
            <p className={`text-sm mt-1 ${proof.storage.verified ? 'text-green-600' : 'text-red-600'}`}>
              {proof.verification.integrity}
            </p>
          </div>

          {/* File Information */}
          <Section title="File Information">
            <Row label="File Name" value={proof.file.fileName || 'Unknown'} />
            <Row label="MIME Type" value={proof.file.mimeType || 'Unknown'} />
            <Row label="File ID" value={proof.file.fileId || '—'} mono />
            <Row label="Owner" value={proof.file.owner || '—'} mono />
          </Section>

          {/* Version Information */}
          <Section title="Version Record">
            <Row label="Version ID" value={proof.version.versionId || '—'} mono />
            <Row label="Timestamp" value={proof.version.timestamp ? new Date(proof.version.timestamp).toLocaleString() : '—'} />
            <Row label="File Size" value={proof.version.size ? formatBytes(proof.version.size) : '—'} />
            {proof.version.aiSummary && (
              <Row label="AI Summary" value={proof.version.aiSummary} />
            )}
          </Section>

          {/* Storage Proof */}
          <Section title="Decentralized Storage Proof">
            <Row label="Provider" value={`${proof.storage.provider} (${proof.storage.network})`} />
            <Row label="Blob ID" value={proof.storage.blobId} mono />
            <Row label="Content Type" value={proof.storage.contentType || '—'} />
            <Row label="Verified Size" value={proof.storage.verifiedSize ? formatBytes(proof.storage.verifiedSize) : '—'} />
            <Row label="Retrieval URL" value={proof.storage.retrievalUrl} mono small />
            <Row label="Verified At" value={proof.storage.verifiedAt ? new Date(proof.storage.verifiedAt).toLocaleString() : '—'} />
          </Section>

          {/* Blockchain Record */}
          <Section title="Blockchain Record">
            <Row label="Blockchain" value={`${proof.blockchain.chain} (${proof.blockchain.network})`} />
            <Row label="Package ID" value={proof.blockchain.packageId || '—'} mono />
            {proof.blockchain.explorerUrl && (
              <Row label="Explorer" value={proof.blockchain.explorerUrl} mono small />
            )}
          </Section>

          {/* Verification Links */}
          <Section title="Verification Links">
            <Row label="Public Verify" value={proof.verification.publicVerifyUrl} mono small />
            <Row label="Share Link" value={proof.verification.shareUrl} mono small />
          </Section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-900 text-center text-xs text-gray-500">
            <p className="font-bold text-gray-700 mb-2">
              This certificate cryptographically attests to the existence and ownership of the above file.
            </p>
            <p>
              The blob ID is a content-addressed hash — any modification to the file content would produce a different blob ID.
              The on-chain record is immutable and publicly verifiable on the Sui blockchain.
            </p>
            <p className="mt-4 text-gray-400">
              SuiDrive • Walrus + Sui • Certificate Schema v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-8 { padding: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false, small = false }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs text-gray-500 font-medium w-32 shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 break-all ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
