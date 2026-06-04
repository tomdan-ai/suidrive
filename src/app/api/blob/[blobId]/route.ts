/**
 * Blob Proxy API
 * Fetches a blob from Walrus and serves it with the correct Content-Type header.
 * This fixes the issue where Walrus aggregator returns everything as application/octet-stream.
 *
 * Usage: /api/blob/<blobId>?type=image/png&name=file.png
 */

import { NextRequest, NextResponse } from 'next/server';

const AGGREGATOR_URL =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
  'https://aggregator.walrus-testnet.walrus.space';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blobId: string }> }
) {
  try {
    const { blobId } = await params;
    const decodedBlobId = decodeURIComponent(blobId);
    const { searchParams } = new URL(request.url);
    const mimeType = searchParams.get('type') || 'application/octet-stream';
    const fileName = searchParams.get('name') || 'download';
    const download = searchParams.get('download') === '1';

    // Fetch from Walrus aggregator
    const walrusUrl = `${AGGREGATOR_URL}/v1/blobs/${decodedBlobId}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(walrusUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Blob not found (${response.status})` },
        { status: response.status }
      );
    }

    const blob = await response.arrayBuffer();

    // Build response with correct headers
    const headers: Record<string, string> = {
      'Content-Type': mimeType,
      'Content-Length': blob.byteLength.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${fileName}"`;
    }

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out — Walrus network may be slow' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch blob' },
      { status: 502 }
    );
  }
}
