/**
 * Sui Client
 * Handles all blockchain interactions
 */

import { Transaction } from '@mysten/sui/transactions';
import type { FileObject, VersionObject } from '@/types';

/**
 * Enhanced Sui client with SuiDrive-specific methods
 * Note: The actual Sui client is provided by the dapp-kit context
 */
export class SuiClientEnhanced {
  private packageId: string;

  constructor() {
    this.packageId = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
  }

  /**
   * Create a transaction to create a new File object on Sui
   */
  createFileTransaction(
    fileId: string,
    name: string,
    mimeType: string
  ): Transaction {
    if (!this.packageId) {
      throw new Error('SUI_PACKAGE_ID not configured. Deploy Move contract first.');
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::file_object::create_file`,
      arguments: [
        tx.pure.string(fileId),
        tx.pure.string(name),
        tx.pure.string(mimeType),
      ],
    });

    return tx;
  }

  /**
   * Create a transaction to create a new Version object on Sui
   */
  createVersionTransaction(
    versionId: string,
    fileId: string,
    walrusBlobId: string,
    previousVersion: string | null,
    aiSummary: string,
    size: number
  ): Transaction {
    if (!this.packageId) {
      throw new Error('SUI_PACKAGE_ID not configured. Deploy Move contract first.');
    }

    const tx = new Transaction();

    // Convert previousVersion to Option type
    const prevVersionArg = previousVersion 
      ? tx.pure.option('string', previousVersion)
      : tx.pure.option('string', null);

    tx.moveCall({
      target: `${this.packageId}::version_object::create_version`,
      arguments: [
        tx.pure.string(versionId),
        tx.pure.string(fileId),
        tx.pure.string(walrusBlobId),
        prevVersionArg,
        tx.pure.string(aiSummary || ''),
        tx.pure.u64(size),
      ],
    });

    return tx;
  }
}

// Export the enhanced client
export const suiClientEnhanced = new SuiClientEnhanced();
