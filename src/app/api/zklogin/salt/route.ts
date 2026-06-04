/**
 * Salt Service API
 * Returns a deterministic salt for a given user (based on JWT sub claim).
 * 
 * In production, use a secure salt service with proper key management.
 * This implementation derives a stable salt from the user's sub + app secret,
 * ensuring the same Google account always maps to the same Sui address.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { jwt } = await request.json();

    if (!jwt) {
      return NextResponse.json({ error: 'JWT required' }, { status: 400 });
    }

    // Decode JWT payload (base64url → JSON) without verifying signature
    // (signature verification happens in the ZK proof step)
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid JWT format' }, { status: 400 });
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );
    const { sub, iss } = payload;

    if (!sub) {
      return NextResponse.json({ error: 'Invalid JWT: no sub claim' }, { status: 400 });
    }

    // Derive a deterministic salt from sub + app secret
    // This ensures the same user always gets the same Sui address
    const secret = process.env.ZKLOGIN_SALT_SECRET || 'suidrive-default-salt-secret';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${iss}:${sub}`)
      .digest('hex');

    // Convert to a BigInt-compatible decimal string (salt must be numeric)
    const salt = BigInt('0x' + hash.slice(0, 32)).toString();

    return NextResponse.json({ salt });
  } catch (error) {
    console.error('Salt service error:', error);
    return NextResponse.json(
      { error: 'Failed to generate salt' },
      { status: 500 }
    );
  }
}
