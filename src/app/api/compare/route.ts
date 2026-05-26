/**
 * Version Comparison API
 * Compares two versions of a file using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { compareVersions } from '@/lib/ai/analyze';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fileName,
      oldSummary,
      newSummary,
      oldBlobId,
      newBlobId,
      mimeType,
      oldTimestamp,
      newTimestamp,
    } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    let oldText = oldSummary || '';
    let newText = newSummary || '';
    let oldSize = 0;
    let newSize = 0;

    const aggregatorUrl =
      process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
      'https://aggregator.walrus-testnet.walrus.space';

    const isText = mimeType?.startsWith('text/') || mimeType === 'application/json';

    // Always probe blob metadata via HEAD to get sizes for the comparison context
    if (oldBlobId && newBlobId) {
      try {
        const [oldHead, newHead] = await Promise.all([
          fetch(`${aggregatorUrl}/v1/blobs/${oldBlobId}`, { method: 'HEAD' }),
          fetch(`${aggregatorUrl}/v1/blobs/${newBlobId}`, { method: 'HEAD' }),
        ]);
        if (oldHead.ok) oldSize = parseInt(oldHead.headers.get('content-length') || '0');
        if (newHead.ok) newSize = parseInt(newHead.headers.get('content-length') || '0');
      } catch (err) {
        console.warn('Could not probe blob metadata:', err);
      }
    }

    // For text files, fetch the actual content for richer comparison
    if (isText && oldBlobId && newBlobId) {
      try {
        const [oldResp, newResp] = await Promise.all([
          fetch(`${aggregatorUrl}/v1/blobs/${oldBlobId}`),
          fetch(`${aggregatorUrl}/v1/blobs/${newBlobId}`),
        ]);

        if (oldResp.ok && newResp.ok) {
          const [oldContent, newContent] = await Promise.all([
            oldResp.text(),
            newResp.text(),
          ]);
          // Truncate content to keep prompt size reasonable
          oldText = oldContent.slice(0, 3000);
          newText = newContent.slice(0, 3000);
        }
      } catch (err) {
        console.warn('Could not fetch text content for comparison:', err);
      }
    }

    // For binary files (images, video, PDF) without summaries, build a metadata
    // comparison and let the AI describe it in plain language.
    const isBinary = !isText;
    const sameBlob = oldBlobId && newBlobId && oldBlobId === newBlobId;

    if (sameBlob) {
      return NextResponse.json({
        comparison:
          'Both versions reference the same Walrus blob — the file content is byte-for-byte identical between these versions.',
      });
    }

    if (isBinary && !oldText && !newText) {
      const metaPrompt = buildBinaryMetadataPrompt({
        fileName,
        mimeType,
        oldBlobId,
        newBlobId,
        oldSize,
        newSize,
        oldTimestamp,
        newTimestamp,
      });
      const result = await compareVersions(metaPrompt, '', fileName);
      return NextResponse.json({ comparison: result });
    }

    if (!oldText && !newText) {
      return NextResponse.json({
        comparison: 'No content available to compare. Both versions lack AI summaries and are not text files.',
      });
    }

    const comparison = await compareVersions(oldText, newText, fileName);

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      {
        error: `Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

function buildBinaryMetadataPrompt(params: {
  fileName: string;
  mimeType?: string;
  oldBlobId: string;
  newBlobId: string;
  oldSize: number;
  newSize: number;
  oldTimestamp?: number;
  newTimestamp?: number;
}): string {
  const { fileName, mimeType, oldBlobId, newBlobId, oldSize, newSize, oldTimestamp, newTimestamp } = params;
  const sizeDelta = newSize - oldSize;
  const sizePct = oldSize > 0 ? ((sizeDelta / oldSize) * 100).toFixed(1) : 'N/A';
  const timeGap = oldTimestamp && newTimestamp
    ? Math.abs(newTimestamp - oldTimestamp)
    : null;
  const timeGapHours = timeGap ? (timeGap / (1000 * 60 * 60)).toFixed(1) : null;

  return `Two versions of a binary file "${fileName}" (${mimeType || 'unknown type'}).

Version 1:
- Walrus blob ID: ${oldBlobId}
- Size: ${oldSize} bytes
${oldTimestamp ? `- Uploaded: ${new Date(oldTimestamp).toISOString()}` : ''}

Version 2:
- Walrus blob ID: ${newBlobId}
- Size: ${newSize} bytes
${newTimestamp ? `- Uploaded: ${new Date(newTimestamp).toISOString()}` : ''}

Differences:
- Size delta: ${sizeDelta > 0 ? '+' : ''}${sizeDelta} bytes (${sizePct}%)
- Different content hashes (blob IDs differ), so the files are not identical.
${timeGapHours ? `- Time between uploads: ${timeGapHours} hours` : ''}`;
}
