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
 * Create a File object on-chain, then transfer to the user
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

  // Create the file object (will be owned by sponsor initially)
  tx.moveCall({
    target: `${PACKAGE_ID}::file_object::create_file`,
    arguments: [
      tx.pure.string(fileId),
      tx.pure.string(name),
      tx.pure.string(mimeType),
    ],
  });

  // The created object is the first result of the move call
  // Transfer it to the actual user
  // Note: public_transfer requires the object from the transaction result
  // We use transferObjects which works on any object with 'store' ability
  const [fileObj] = tx.moveCall({
    target: `${PACKAGE_ID}::file_object::create_file`,
    arguments: [
      tx.pure.string(fileId),
      tx.pure.string(name),
      tx.pure.string(mimeType),
    ],
  });

  // Actually, the contract already does transfer::public_transfer to sender.
  // Since sender = sponsor, we need a different approach:
  // We'll execute the create, then in a follow-up the sponsor transfers to user.
  // But we can't split a PTB's internal transfer...
  //
  // Better approach: just execute create_file (objects go to sponsor),
  // then the result will include the created object IDs,
  // and we do a second transaction to transfer them.

  // Reset and do it properly
  const createTx = new Transaction();
  createTx.moveCall({
    target: `${PACKAGE_ID}::file_object::create_file`,
    arguments: [
      createTx.pure.string(fileId),
      createTx.pure.string(name),
      createTx.pure.string(mimeType),
    ],
  });
  createTx.setSender(sponsor.toSuiAddress());

  const createBytes = await createTx.build({ client: suiClient });
  const { signature: createSig } = await sponsor.signTransaction(createBytes);

  const createResult = await suiClient.executeTransactionBlock({
    transactionBlock: createBytes,
    signature: createSig,
    options: { showEffects: true, showObjectChanges: true },
  });

  // Find the created object ID
  const createdObj = createResult.objectChanges?.find(
    (c: any) => c.type === 'created' && c.objectType?.includes('file_object::FileObject')
  );

  if (createdObj && ownerAddress !== sponsor.toSuiAddress()) {
    // Transfer the object to the actual user
    const transferTx = new Transaction();
    transferTx.transferObjects(
      [transferTx.object((createdObj as any).objectId)],
      transferTx.pure.address(ownerAddress)
    );
    transferTx.setSender(sponsor.toSuiAddress());

    const transferBytes = await transferTx.build({ client: suiClient });
    const { signature: transferSig } = await sponsor.signTransaction(transferBytes);

    await suiClient.executeTransactionBlock({
      transactionBlock: transferBytes,
      signature: transferSig,
      options: { showEffects: true },
    });
  }

  return NextResponse.json({
    digest: createResult.digest,
    effects: createResult.effects,
    objectChanges: createResult.objectChanges,
  });
}

/**
 * Create a Version object on-chain, then transfer to the user
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

  // Step 1: Create version object
  const createTx = new Transaction();
  const prevVersionArg = previousVersion
    ? createTx.pure.option('string', previousVersion)
    : createTx.pure.option('string', null);

  createTx.moveCall({
    target: `${PACKAGE_ID}::version_object::create_version`,
    arguments: [
      createTx.pure.string(versionId),
      createTx.pure.string(fileId),
      createTx.pure.string(walrusBlobId),
      prevVersionArg,
      createTx.pure.string(aiSummary || ''),
      createTx.pure.u64(size),
    ],
  });
  createTx.setSender(sponsor.toSuiAddress());

  const createBytes = await createTx.build({ client: suiClient });
  const { signature: createSig } = await sponsor.signTransaction(createBytes);

  const createResult = await suiClient.executeTransactionBlock({
    transactionBlock: createBytes,
    signature: createSig,
    options: { showEffects: true, showObjectChanges: true },
  });

  // Step 2: Transfer to user
  const createdObj = createResult.objectChanges?.find(
    (c: any) => c.type === 'created' && c.objectType?.includes('version_object::VersionObject')
  );

  if (createdObj && ownerAddress !== sponsor.toSuiAddress()) {
    const transferTx = new Transaction();
    transferTx.transferObjects(
      [transferTx.object((createdObj as any).objectId)],
      transferTx.pure.address(ownerAddress)
    );
    transferTx.setSender(sponsor.toSuiAddress());

    const transferBytes = await transferTx.build({ client: suiClient });
    const { signature: transferSig } = await sponsor.signTransaction(transferBytes);

    await suiClient.executeTransactionBlock({
      transactionBlock: transferBytes,
      signature: transferSig,
      options: { showEffects: true },
    });
  }

  return NextResponse.json({
    digest: createResult.digest,
    effects: createResult.effects,
    objectChanges: createResult.objectChanges,
  });
}
