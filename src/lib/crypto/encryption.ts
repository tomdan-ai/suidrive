/**
 * Client-Side Encryption Module
 * AES-256-GCM encryption for files before Walrus upload
 *
 * Key derivation: PBKDF2(walletAddress + fileSalt) → AES-256-GCM key
 * This means:
 *   - Only the wallet owner can decrypt
 *   - Each file has a unique salt (stored on-chain as metadata)
 *   - No key management needed — key is deterministically reproduced from wallet address
 *
 * Encrypted blob format:
 *   [12 bytes IV] [encrypted payload...]
 *   The salt is stored separately in the on-chain metadata, not in the blob.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16; // 128-bit salt per file
const PBKDF2_ITERATIONS = 100_000;

/**
 * Generate a random salt for a new file encryption
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return uint8ToHex(salt);
}

/**
 * Derive an AES-256-GCM key from a wallet address and a salt
 */
async function deriveKey(walletAddress: string, saltHex: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(walletAddress),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = hexToUint8(saltHex);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a File object and return an encrypted Blob
 * Returns the encrypted blob and the salt used (must be stored on-chain)
 */
export async function encryptFile(
  file: File,
  walletAddress: string,
  saltHex?: string
): Promise<{ encryptedBlob: Blob; salt: string; originalSize: number }> {
  const salt = saltHex || generateSalt();
  const key = await deriveKey(walletAddress, salt);

  // Read file as ArrayBuffer
  const plaintext = await file.arrayBuffer();

  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintext
  );

  // Pack: [IV (12 bytes)] [ciphertext]
  const encrypted = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  encrypted.set(iv, 0);
  encrypted.set(new Uint8Array(ciphertext), IV_LENGTH);

  const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });

  return {
    encryptedBlob,
    salt,
    originalSize: plaintext.byteLength,
  };
}

/**
 * Decrypt an encrypted blob back to the original file bytes
 */
export async function decryptBlob(
  encryptedData: ArrayBuffer,
  walletAddress: string,
  saltHex: string
): Promise<ArrayBuffer> {
  const key = await deriveKey(walletAddress, saltHex);

  const data = new Uint8Array(encryptedData);

  // Unpack: [IV (12 bytes)] [ciphertext]
  const iv = data.slice(0, IV_LENGTH);
  const ciphertext = data.slice(IV_LENGTH);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return plaintext;
}

/**
 * Decrypt a Walrus blob by fetching it and decrypting
 */
export async function decryptWalrusBlob(
  blobId: string,
  walletAddress: string,
  saltHex: string
): Promise<ArrayBuffer> {
  const aggregatorUrl =
    process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
    'https://aggregator.walrus-testnet.walrus.space';
  const url = `${aggregatorUrl}/v1/blobs/${blobId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch encrypted blob: ${response.status}`);
  }

  const encryptedData = await response.arrayBuffer();
  return decryptBlob(encryptedData, walletAddress, saltHex);
}

// --- Utility helpers ---

function uint8ToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToUint8(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
