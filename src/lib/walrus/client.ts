/**
 * Walrus Client
 * Handles all interactions with Walrus decentralized storage.
 * Uses a server-side proxy to avoid browser SSL/CORS issues with the Walrus testnet.
 */

/**
 * Enhanced Walrus client with additional utilities
 */
export class WalrusClient {
  /**
   * Upload a file to Walrus via our API proxy.
   * The proxy handles the actual PUT to the Walrus publisher from the server side,
   * avoiding browser SSL certificate issues with the testnet endpoint.
   */
  async uploadFile(file: File): Promise<{ blobId: string; suiRef?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/walrus/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Upload failed (${response.status})`);
      }

      const data = await response.json();

      // Handle different response formats from Walrus
      if (data.newlyCreated) {
        return {
          blobId: data.newlyCreated.blobObject.blobId,
          suiRef: data.newlyCreated.blobObject.id,
        };
      } else if (data.alreadyCertified) {
        return {
          blobId: data.alreadyCertified.blobId,
          suiRef: data.alreadyCertified.event?.txDigest,
        };
      }

      throw new Error('Unexpected Walrus response format');
    } catch (error) {
      console.error('Walrus upload error:', error);
      throw new Error(
        `Failed to upload to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Retrieve a file from Walrus by blob ID
   */
  async getFile(blobId: string): Promise<Uint8Array> {
    const url = this.getBlobUrl(blobId);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to retrieve blob ${blobId}: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Get blob URL for direct access
   */
  getBlobUrl(blobId: string): string {
    const aggregatorUrl =
      process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
      'https://aggregator.walrus-testnet.walrus.space';
    return `${aggregatorUrl}/v1/blobs/${blobId}`;
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getBlobUrl(blobId), { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const walrusClient = new WalrusClient();
