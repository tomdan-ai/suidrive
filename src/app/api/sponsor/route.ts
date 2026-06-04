/**
 * Transaction Sponsorship API
 * 
 * Two-step flow for gas sponsorship:
 * 
 * Step 1: POST /api/sponsor (action: "prepare")
 *   - Client sends raw transaction bytes (before signing)
 *   - Server sets gas owner to sponsor, builds with gas, returns new tx bytes
 * 
 * Step 2: POST /api/sponsor (action: "execute")
 *   - Client sends the sponsor-prepared tx bytes + user's zkLogin signature
 *   - Server co-signs with sponsor key and executes
 */

import { NextRequest, NextResponse } from 'next/server';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { fromBase64, toBase64 } from '@mysten/sui/utils';

// --- Sponsor Keypair (deployer wallet) ---
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

    if (action === 'prepare') {
      return handlePrepare(body);
    } else if (action === 'execute') {
      return handleExecute(body);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "prepare" or "execute".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Sponsor API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sponsorship failed' },
      { status: 500 }
    );
  }
}

/**
 * Step 1: Prepare — set gas owner to sponsor and rebuild
 */
async function handlePrepare(body: { txBytes: string; sender: string }) {
  const { txBytes, sender } = body;

  if (!txBytes || !sender) {
    return NextResponse.json(
      { error: 'txBytes and sender are required' },
      { status: 400 }
    );
  }

  const sponsor = getSponsorKeypair();
  const sponsorAddress = sponsor.toSuiAddress();

  // Parse the transaction kind (without gas info)
  const tx = Transaction.from(fromBase64(txBytes));

  // Set the gas owner to the sponsor
  tx.setGasOwner(sponsorAddress);
  // Ensure sender is correct
  tx.setSender(sender);

  // Rebuild with gas selection from sponsor's coins
  const preparedBytes = await tx.build({ client: suiClient });

  return NextResponse.json({
    txBytes: toBase64(preparedBytes),
    sponsorAddress,
  });
}

/**
 * Step 2: Execute — sponsor co-signs and submits
 */
async function handleExecute(body: { txBytes: string; userSignature: string }) {
  const { txBytes, userSignature } = body;

  if (!txBytes || !userSignature) {
    return NextResponse.json(
      { error: 'txBytes and userSignature are required' },
      { status: 400 }
    );
  }

  const sponsor = getSponsorKeypair();

  // Sign with the sponsor's key
  const txBytesArray = fromBase64(txBytes);
  const { signature: sponsorSignature } = await sponsor.signTransaction(txBytesArray);

  // Execute with both signatures
  const result = await suiClient.executeTransactionBlock({
    transactionBlock: txBytesArray,
    signature: [userSignature, sponsorSignature],
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  return NextResponse.json({
    digest: result.digest,
    effects: result.effects,
    objectChanges: result.objectChanges,
  });
}
