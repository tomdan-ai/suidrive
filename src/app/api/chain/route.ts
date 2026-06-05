/**
 * Chain Transaction API
 * Executes blockchain transactions entirely server-side using the sponsor/deployer key.
 * No user signing required — the sponsor builds, signs, and submits.
 *
 * This gives a seamless UX: users never see wallet popups for on-chain operations.
 * The user's address is stored as the "owner" in the Move objects.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64 } from '@mysten/sui/utils';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

// --- Sponsor Keypair ---
function getSponsorKeypair(): Ed25519Keypair {
  const secretKey = process.env.SUI_SPONSOR_SECRET_KEY;
  if (!secretKey) {
    throw new Error('SUI_SPONSOR_SECRET_KEY not configured');
  }
  if (secretKey.startsWith('suiprivkey')) {
    return Ed25519Keypair.fromSecretKey(secretKey);
  }
  return Ed25519Keypair.fromSecretKey(fromBase64(secretKey));
}

// --- Sui Client ---
const suiClient = new SuiJsonRpcClient({
  url: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet'
    ? 'https://fullnode.mainnet.sui.io:443'
    : 'https://fullnode.testnet.sui.io:443',
  network: process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet' ? 'mainnet' : 'testnet',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!PACKAGE_ID) {
      return NextResponse.json(
        { error: 'SUI_PACKAGE_ID not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'createFile':
        return handleCreateFile(body);
      case 'createVersion':
        return handleCreateVersion(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chain API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chain transaction failed' },
      { status: 500 }
    );
  }
}

/**
 * Create a File object on-chain
 */
async function handleCreateFile(body: {
  fileId: string;
  name: string;
  mimeType: string;
  ownerAddress: string;
}) {
  const { fileId, name, mimeType, ownerAddress } = body;

  if (!fileId || !name || !mimeType || !ownerAddress) {
    return NextResponse.json(
      { error: 'fileId, name, mimeType, and ownerAddress are required' },
      { status: 400 }
    );
  }

  const sponsor = getSponsorKeypair();
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::file_object::create_file`,
    arguments: [
      tx.pure.string(fileId),
      tx.pure.string(name),
      tx.pure.string(mimeType),
    ],
  });

  // Sponsor is both sender and gas payer
  tx.setSender(sponsor.toSuiAddress());

  const builtBytes = await tx.build({ client: suiClient });
  const { signature } = await sponsor.signTransaction(builtBytes);

  const result = await suiClient.executeTransactionBlock({
    transactionBlock: builtBytes,
    signature,
    options: { showEffects: true, showObjectChanges: true },
  });

  return NextResponse.json({
    digest: result.digest,
    effects: result.effects,
    objectChanges: result.objectChanges,
  });
}

/**
 * Create a Version object on-chain
 */
async function handleCreateVersion(body: {
  versionId: string;
  fileId: string;
  walrusBlobId: string;
  previousVersion: string | null;
  aiSummary: string;
  size: number;
  ownerAddress: string;
}) {
  const { versionId, fileId, walrusBlobId, previousVersion, aiSummary, size, ownerAddress } = body;

  if (!versionId || !fileId || !walrusBlobId || !ownerAddress) {
    return NextResponse.json(
      { error: 'versionId, fileId, walrusBlobId, and ownerAddress are required' },
      { status: 400 }
    );
  }

  const sponsor = getSponsorKeypair();
  const tx = new Transaction();

  const prevVersionArg = previousVersion
    ? tx.pure.option('string', previousVersion)
    : tx.pure.option('string', null);

  tx.moveCall({
    target: `${PACKAGE_ID}::version_object::create_version`,
    arguments: [
      tx.pure.string(versionId),
      tx.pure.string(fileId),
      tx.pure.string(walrusBlobId),
      prevVersionArg,
      tx.pure.string(aiSummary || ''),
      tx.pure.u64(size),
    ],
  });

  // Sponsor is both sender and gas payer
  tx.setSender(sponsor.toSuiAddress());

  const builtBytes = await tx.build({ client: suiClient });
  const { signature } = await sponsor.signTransaction(builtBytes);

  const result = await suiClient.executeTransactionBlock({
    transactionBlock: builtBytes,
    signature,
    options: { showEffects: true, showObjectChanges: true },
  });

  return NextResponse.json({
    digest: result.digest,
    effects: result.effects,
    objectChanges: result.objectChanges,
  });
}
