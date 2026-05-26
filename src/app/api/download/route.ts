/**
 * Download API Route
 * Proxies Walrus blob downloads to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const blobId = searchParams.get('blobId');
  const fileName = searchParams.get('fileName');

  if (!blobId) {
    return NextResponse.json(
      { error: 'Missing blobId parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch from Walrus aggregator
    const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 
      'https://aggregator.walrus-testnet.walrus.space';
    
    const walrusUrl = `${aggregatorUrl}/v1/blobs/${blobId}`;
    
    const response = await fetch(walrusUrl, {
      method: 'GET',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Walrus: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the blob data
    const blob = await response.blob();
    
    // Create response with appropriate headers
    const headers = new Headers();
    
    // Set content type from Walrus response or default
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    headers.set('Content-Type', contentType);
    
    // Set content disposition for downloads
    if (fileName) {
      headers.set('Content-Disposition', `inline; filename="${fileName}"`);
    }
    
    // Add CORS headers to allow browser access
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Cache for 1 hour (blobs are immutable)
    headers.set('Cache-Control', 'public, max-age=3600, immutable');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Download error:', error);
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout - blob may be too large or network is slow' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
