/**
 * Public Share Page
 * Anyone with the link can view this file (if unencrypted)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/utils';

const AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

export default function SharePage({ params }: { params: Promise<{ blobId: string }> }) {
  const { blobId } = React.use(params);
  const decodedBlobId = decodeURIComponent(blobId);
  const walrusUrl = `${AGGREGATOR_URL}/v1/blobs/${decodedBlobId}`;

  const [meta, setMeta] = useState<{ size: number; contentType: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(walrusUrl, { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) { setNotFound(true); return; }
        setMeta({
          size: parseInt(r.headers.get('content-length') || '0'),
          contentType: r.headers.get('content-type') || 'application/octet-stream',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [walrusUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">File Not Found</h1>
          <p className="text-gray-400 mb-6">This shared file does not exist or has expired.</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const contentType = meta?.contentType || '';
  const isImage = contentType.startsWith('image/');
  const isVideo = contentType.startsWith('video/');
  const isAudio = contentType.startsWith('audio/');
  const isPdf = contentType === 'application/pdf';
  const isText = contentType.startsWith('text/') || contentType === 'application/json';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm italic">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter italic">SuiDrive</span>
            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
              Shared File
            </span>
          </div>
          <Link href="/verify" className="text-sm text-gray-400 hover:text-white transition">
            🔍 Verify Authenticity
          </Link>
        </div>

        {/* File Info Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden">
            {/* Meta bar */}
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Type: <span className="text-white font-medium">{contentType}</span>
                </span>
                {meta && meta.size > 0 && (
                  <span className="text-sm text-gray-400">
                    Size: <span className="text-white font-medium">{formatBytes(meta.size)}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={walrusUrl}
                  download
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                >
                  ⬇ Download
                </a>
                <Link
                  href={`/verify/${encodeURIComponent(decodedBlobId)}`}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                >
                  ✓ Verify
                </Link>
              </div>
            </div>

            {/* Preview area */}
            <div className="p-6">
              {isImage && (
                <div className="flex justify-center">
                  <img src={walrusUrl} alt="Shared file" className="max-w-full max-h-[70vh] rounded-lg shadow-xl" />
                </div>
              )}
              {isVideo && (
                <video controls className="w-full max-h-[70vh] rounded-lg">
                  <source src={walrusUrl} type={contentType} />
                </video>
              )}
              {isAudio && (
                <div className="py-12 flex justify-center">
                  <audio controls className="w-full max-w-lg">
                    <source src={walrusUrl} type={contentType} />
                  </audio>
                </div>
              )}
              {isPdf && (
                <iframe src={walrusUrl} className="w-full h-[70vh] rounded-lg bg-white" />
              )}
              {isText && <TextPreview url={walrusUrl} />}
              {!isImage && !isVideo && !isAudio && !isPdf && !isText && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                  <a
                    href={walrusUrl}
                    download
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Blob ID footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 font-mono break-all">
              Walrus Blob ID: {decodedBlobId}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Stored permanently on <a href="https://docs.wal.app" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Walrus</a> decentralized storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = React.useState<string | null>(null);
  React.useEffect(() => {
    fetch(url).then(r => r.text()).then(t => setText(t.slice(0, 10000))).catch(() => setText('Failed to load'));
  }, [url]);
  return (
    <div className="max-h-[60vh] overflow-auto bg-gray-900/80 rounded-lg p-6 font-mono text-sm text-gray-300">
      <pre className="whitespace-pre-wrap break-words">{text ?? 'Loading...'}</pre>
    </div>
  );
}
