/**
 * Walrus Client
 * Handles all interactions with Walrus decentralized storage
 */

import { WalrusClient as BaseWalrusClient } from "@mysten/walrus";
import { suiClient } from "@/lib/sui/client";

// Initialize base Walrus client
const baseClient = new BaseWalrusClient({
  network: "testnet",
  suiClient,
});

/**
 * Enhanced Walrus client with additional utilities
 */
export class WalrusClient {
  private client: BaseWalrusClient;

  constructor() {
    this.client = baseClient;
  }

  /**
   * Upload a file to Walrus
   * Returns the blob ID for permanent storage
   */
  async uploadFile(file: File): Promise<{ blobId: string; suiRef?: string }> {
    try {
      // Convert File to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // For now, use the readBlob method to test connectivity
      // Full upload will be implemented in Phase 2 with proper wallet integration
      // The writeBlob method requires a signer which we'll add with wallet integration
      
      // Temporary: Return mock data for Phase 1
      // TODO: Implement full upload with wallet signer in Phase 2
      console.warn('Walrus upload: Using mock data. Full implementation requires wallet signer (Phase 2)');
      
      const mockBlobId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        blobId: mockBlobId,
        suiRef: undefined,
      };
    } catch (error) {
      console.error('Walrus upload error:', error);
      throw new Error(`Failed to upload to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a file from Walrus by blob ID
   */
  async getFile(blobId: string): Promise<Uint8Array> {
    try {
      const data = await this.client.readBlob({ blobId });
      return data;
    } catch (error) {
      console.error('Walrus retrieval error:', error);
      throw new Error(`Failed to retrieve from Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get blob URL for direct access
   */
  getBlobUrl(blobId: string): string {
    return `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      await this.client.readBlob({ blobId });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the base client for advanced usage
   */
  getBaseClient(): BaseWalrusClient {
    return this.client;
  }
}

// Singleton instance
export const walrusClient = new WalrusClient();
