/**
 * Public Share Page
 * Anyone with the link can view this file (if unencrypted)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBytes } from '@/lib/utils';
import { AlertTriangle, RefreshCw, Download, Shield, ExternalLink } from 'lucide-react';

const AGGREGATOR_URL = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Detect mime type from file magic bytes (first few bytes of the file)
 */
function detectMimeType(bytes: Uint8Array): string | null {
  if (bytes.length < 4) return null;

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif';
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  // PDF: 25 50 44 46
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }
  // MP4: ... 66 74 79 70 (at offset 4)
  if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return 'video/mp4';
  }
  // ZIP: 50 4B 03 04
  if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return 'application/zip';
  }

  // Check if it looks like text/JSON (printable ASCII)
  const isText = bytes.every(b => (b >= 0x09 && b <= 0x0D) || (b >= 0x20 && b <= 0x7E));
  if (isText) {
    if (bytes[0] === 0x7B) return 'application/json'; // starts with {
    return 'text/plain';
  }

  return null;
}

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; meta: { size: number; contentType: string } }
  | { status: 'not_found' }
  | { status: 'network_error'; message: string };

export default function SharePage({ params }: { params: Promise<{ blobId: string }> }) {
  const { blobId } = React.use(params);
  const decodedBlobId = decodeURIComponent(blobId);

  // Read mime type and filename from query params (set by ShareDialog)
  const [queryType, setQueryType] = useState<string | null>(null);
  const [queryName, setQueryName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setQueryType(params.get('type'));
      setQueryName(params.get('name'));
    }
  }, []);

  // Proxy URL serves with correct Content-Type (built after state resolves below)
  // Direct Walrus URL for initial check
  const walrusUrl = `${AGGREGATOR_URL}/v1/blobs/${decodedBlobId}`;

  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [retrying, setRetrying] = useState(false);

  const loadFile = async () => {
    setState({ status: 'loading' });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      // Fetch first few bytes to detect mime type from magic bytes
      const r = await fetch(walrusUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Range': 'bytes=0-11' },
      });
      clearTimeout(timeout);

      if (r.ok || r.status === 206) {
        const headerContentType = r.headers.get('content-type') || 'application/octet-stream';
        const size = parseInt(r.headers.get('content-range')?.split('/')[1] || r.headers.get('content-length') || '0');

        // Detect mime type from magic bytes if aggregator returns generic type
        let detectedType = headerContentType;
        if (headerContentType === 'application/octet-stream') {
          const bytes = new Uint8Array(await r.arrayBuffer());
          detectedType = detectMimeType(bytes) || 'application/octet-stream';
        }

        setState({
          status: 'ready',
          meta: {
            size,
            contentType: detectedType,
          },
        });
      } else if (r.status === 404) {
        setState({ status: 'not_found' });
      } else {
        setState({
          status: 'network_error',
          message: `Walrus returned status ${r.status}`,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setState({ status: 'network_error', message: 'Request timed out — the storage network may be slow.' });
        } else if (err.message.includes('SSL') || err.message.includes('ERR_CERT') || err.message.includes('Failed to fetch')) {
          setState({
            status: 'network_error',
            message: 'Unable to reach Walrus storage network. This is usually a temporary infrastructure issue.',
          });
        } else {
          setState({ status: 'network_error', message: err.message });
        }
      } else {
        setState({ status: 'network_error', message: 'An unexpected error occurred.' });
      }
    }
  };

  useEffect(() => {
    loadFile();
  }, [walrusUrl]);

  const handleRetry = async () => {
    setRetrying(true);
    await loadFile();
    setRetrying(false);
  };

  // --- Loading ---
  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Fetching from Walrus network...</p>
        </div>
      </div>
    );
  }

  // --- Network Error ---
  if (state.status === 'network_error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 space-y-6">
          <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
            <AlertTriangle size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold">Storage Network Unavailable</h1>
          <p className="text-gray-400 text-sm leading-relaxed">{state.message}</p>
          <p className="text-gray-500 text-xs">
            Your file is safe — it&apos;s stored permanently on the decentralized network. 
            This is a temporary connectivity issue with the Walrus testnet infrastructure.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 rounded-xl font-semibold text-sm transition"
            >
              <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Retrying...' : 'Try Again'}
            </button>
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition">
              Go Home
            </Link>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-600 font-mono break-all">
              Blob ID: {decodedBlobId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Not Found ---
  if (state.status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold">File Not Found</h1>
          <p className="text-gray-400 text-sm">
            This blob ID does not exist on the Walrus network. It may have expired or the link is incorrect.
          </p>
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-sm transition"
            >
              <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
              Retry
            </button>
            <Link href="/" className="text-sm text-gray-500 hover:text-white transition">
              Go Home
            </Link>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-600 font-mono break-all">
              Blob ID: {decodedBlobId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Ready: Show file ---
  // Prefer mime type from query params (reliable), fall back to detected type from magic bytes
  const contentType = queryType || state.meta.contentType || 'application/octet-stream';
  const fileName = queryName || 'download';
  const isImage = contentType.startsWith('image/');
  const isVideo = contentType.startsWith('video/');
  const isAudio = contentType.startsWith('audio/');
  const isPdf = contentType === 'application/pdf';
  const isText = contentType.startsWith('text/') || contentType === 'application/json';

  // Build proxy URLs with the resolved content type
  const resolvedProxyUrl = `/api/blob/${encodeURIComponent(decodedBlobId)}?type=${encodeURIComponent(contentType)}&name=${encodeURIComponent(fileName)}`;
  const resolvedDownloadUrl = `/api/blob/${encodeURIComponent(decodedBlobId)}?download=1&type=${encodeURIComponent(contentType)}&name=${encodeURIComponent(fileName)}`;

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
          <Link href={`/verify/${encodeURIComponent(decodedBlobId)}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <Shield size={14} />
            Verify Authenticity
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
                {state.meta.size > 0 && (
                  <span className="text-sm text-gray-400">
                    Size: <span className="text-white font-medium">{formatBytes(state.meta.size)}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={resolvedDownloadUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
                >
                  <Download size={14} /> Download
                </a>
                <Link
                  href={`/verify/${encodeURIComponent(decodedBlobId)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
                >
                  <Shield size={14} /> Verify
                </Link>
              </div>
            </div>

            {/* Preview area */}
            <div className="p-6">
              {isImage && (
                <div className="flex justify-center">
                  <img src={resolvedProxyUrl} alt="Shared file" className="max-w-full max-h-[70vh] rounded-lg shadow-xl" />
                </div>
              )}
              {isVideo && (
                <video controls className="w-full max-h-[70vh] rounded-lg">
                  <source src={resolvedProxyUrl} type={contentType} />
                </video>
              )}
              {isAudio && (
                <div className="py-12 flex justify-center">
                  <audio controls className="w-full max-w-lg">
                    <source src={resolvedProxyUrl} type={contentType} />
                  </audio>
                </div>
              )}
              {isPdf && (
                <iframe src={resolvedProxyUrl} className="w-full h-[70vh] rounded-lg bg-white" />
              )}
              {isText && <TextPreview url={resolvedProxyUrl} />}
              {!isImage && !isVideo && !isAudio && !isPdf && !isText && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-gray-400 mb-4">Preview not available for this file type</p>
                  <a
                    href={resolvedDownloadUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    <Download size={16} /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Blob ID footer */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-gray-500 font-mono break-all">
              Walrus Blob ID: {decodedBlobId}
            </p>
            <p className="text-xs text-gray-600">
              Stored permanently on{' '}
              <a href="https://docs.wal.app" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
                Walrus <ExternalLink size={10} />
              </a>{' '}
              decentralized storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.text();
      })
      .then((t) => setText(t.slice(0, 10000)))
      .catch(() => setError(true));
    return () => controller.abort();
  }, [url]);

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Failed to load text preview.{' '}
        <a href={url} download className="text-blue-400 hover:underline">Download instead</a>
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-auto bg-gray-900/80 rounded-lg p-6 font-mono text-sm text-gray-300">
      <pre className="whitespace-pre-wrap break-words">{text ?? 'Loading...'}</pre>
    </div>
  );
}
