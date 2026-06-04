/**
 * Walrus Upload Proxy
 * Proxies file uploads to Walrus publisher from the server side.
 * This avoids browser SSL/CORS issues with the Walrus testnet endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';

const PUBLISHER_URL =
  process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL ||
  'https://publisher.walrus-testnet.walrus.space';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const epochs = 5;
    const fileBuffer = await file.arrayBuffer();

    const response = await fetch(
      `${PUBLISHER_URL}/v1/blobs?epochs=${epochs}&force=true`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Walrus upload failed (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Walrus proxy upload error:', error);
    return NextResponse.json(
      { error: `Upload proxy failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 502 }
    );
  }
}
