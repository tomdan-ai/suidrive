/**
 * Transaction Sponsorship API
 * 
 * Single-step flow:
 * Client sends the serialized Transaction (not yet built/signed).
 * Server sets gas owner, builds, signs as sponsor, and returns the 
 * built bytes for the client to co-sign and send back for execution.
 *
 * Step 1: POST { action: "sponsor", txBytes, sender }
 *   → Returns { txBytes (built with gas), sponsorAddress }
 *
 * Step 2: POST { action: "execute", txBytes, userSignature }
 *   → Sponsor co-signs and executes, returns { digest }
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
    throw new Error('SUI_SPONSOR_SECRET_KEY not configured. Add your deployer private key to .env.local');
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
 * Step 1: Prepare — deserialize tx, set gas owner, build with sponsor's gas coins
 */
async function handlePrepare(body: { txBytes: string; sender: string }) {
  const { txBytes, sender } = body;

  if (!txBytes || !sender) {
    return NextResponse.json(
      { error: 'txBytes and sender are required' },
      { status: 400 }
    );
  }

  try {
    const sponsor = getSponsorKeypair();
    const sponsorAddress = sponsor.toSuiAddress();

    // Deserialize the transaction — supports both built bytes and serialized JSON format
    let tx: Transaction;
    try {
      // Try as raw built bytes first
      tx = Transaction.from(fromBase64(txBytes));
    } catch {
      // Fall back to JSON serialized format (from Transaction.serialize())
      const decoded = atob(txBytes);
      tx = Transaction.from(decoded);
    }

    // Set gas payment from sponsor
    tx.setSender(sender);
    tx.setGasOwner(sponsorAddress);

    // Build — this resolves gas coins from the sponsor's account
    const builtBytes = await tx.build({ client: suiClient });

    return NextResponse.json({
      txBytes: toBase64(builtBytes),
      sponsorAddress,
    });
  } catch (error) {
    console.error('Sponsor prepare error:', error);
    return NextResponse.json(
      { error: `Prepare failed: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}

/**
 * Step 2: Execute — sponsor co-signs the built bytes and submits with user's signature
 */
async function handleExecute(body: { txBytes: string; userSignature: string }) {
  const { txBytes, userSignature } = body;

  if (!txBytes || !userSignature) {
    return NextResponse.json(
      { error: 'txBytes and userSignature are required' },
      { status: 400 }
    );
  }

  try {
    const sponsor = getSponsorKeypair();
    const txBytesArray = fromBase64(txBytes);

    // Sponsor signs the same built bytes
    const { signature: sponsorSignature } = await sponsor.signTransaction(txBytesArray);

    // Execute with both signatures: [user, sponsor]
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
  } catch (error) {
    console.error('Sponsor execute error:', error);
    return NextResponse.json(
      { error: `Execute failed: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
