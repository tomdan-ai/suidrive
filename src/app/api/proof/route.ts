/**
 * Proof Certificate API
 * Generates a JSON proof document with full on-chain provenance
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const blobId = searchParams.get('blobId');
  const versionId = searchParams.get('versionId');
  const fileId = searchParams.get('fileId');
  const fileName = searchParams.get('fileName');
  const mimeType = searchParams.get('mimeType');
  const owner = searchParams.get('owner');
  const timestamp = searchParams.get('timestamp');
  const size = searchParams.get('size');
  const aiSummary = searchParams.get('aiSummary');

  if (!blobId) {
    return NextResponse.json({ error: 'blobId is required' }, { status: 400 });
  }

  const aggregatorUrl =
    process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
    'https://aggregator.walrus-testnet.walrus.space';

  // Verify blob still exists on Walrus
  let walrusVerified = false;
  let walrusSize = 0;
  let walrusContentType = '';
  try {
    const headResp = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`, { method: 'HEAD' });
    if (headResp.ok) {
      walrusVerified = true;
      walrusSize = parseInt(headResp.headers.get('content-length') || '0');
      walrusContentType = headResp.headers.get('content-type') || '';
    }
  } catch {}

  const packageId = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

  const proof = {
    '@context': 'https://suidrive.io/proof/v1',
    type: 'SuiDriveProofCertificate',
    schemaVersion: '1.0.0',
    generated: new Date().toISOString(),
    network: 'sui:testnet',

    file: {
      fileId: fileId || null,
      fileName: fileName || null,
      mimeType: mimeType || walrusContentType || null,
      owner: owner || null,
    },

    version: {
      versionId: versionId || null,
      timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : null,
      timestampMs: timestamp ? parseInt(timestamp) : null,
      size: size ? parseInt(size) : walrusSize,
      aiSummary: aiSummary || null,
    },

    storage: {
      provider: 'Walrus',
      network: 'testnet',
      blobId,
      retrievalUrl: `${aggregatorUrl}/v1/blobs/${blobId}`,
      verified: walrusVerified,
      verifiedAt: walrusVerified ? new Date().toISOString() : null,
      verifiedSize: walrusSize,
      contentType: walrusContentType || null,
    },

    blockchain: {
      chain: 'Sui',
      network: 'testnet',
      packageId: packageId || null,
      explorerUrl: owner
        ? `https://suiexplorer.com/address/${owner}?network=testnet`
        : null,
    },

    verification: {
      publicVerifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${encodeURIComponent(blobId)}`,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${encodeURIComponent(blobId)}`,
      integrity: walrusVerified
        ? 'PASS: Blob exists on Walrus and is retrievable'
        : 'FAIL: Blob could not be verified on Walrus',
    },
  };

  // Return as JSON with download headers
  const format = searchParams.get('format');
  if (format === 'download') {
    return new NextResponse(JSON.stringify(proof, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="suidrive-proof-${blobId.slice(0, 8)}.json"`,
      },
    });
  }

  return NextResponse.json(proof);
}
