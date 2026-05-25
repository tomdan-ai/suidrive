/**
 * Sui Client via Tatum
 * Handles all blockchain interactions through Tatum RPC infrastructure
 */

import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import type { FileObject, VersionObject } from "@/types";

const network = (process.env.SUI_NETWORK ?? "testnet") as "testnet" | "mainnet" | "devnet" | "localnet";
const url = process.env.TATUM_SUI_RPC_URL ?? getJsonRpcFullnodeUrl(network);

// Base Sui client
const baseSuiClient = new SuiJsonRpcClient({ url, network });

/**
 * Enhanced Sui client with SuiDrive-specific methods
 */
export class SuiClient {
  private client: SuiJsonRpcClient;
  private packageId: string;

  constructor() {
    this.client = baseSuiClient;
    this.packageId = process.env.SUI_PACKAGE_ID || '';
  }

  /**
   * Get the base client for direct access
   */
  getBaseClient(): SuiJsonRpcClient {
    return this.client;
  }

  /**
   * Create a new File object on Sui
   * TODO: Implement after Move contract deployment
   */
  async createFileObject(
    owner: string,
    fileId: string,
    name?: string,
    mimeType?: string
  ): Promise<string> {
    if (!this.packageId) {
      throw new Error('SUI_PACKAGE_ID not configured. Deploy Move contract first.');
    }

    // TODO: Implement actual Move contract call
    // For now, return a mock transaction digest
    console.warn('createFileObject: Move contract not yet deployed');
    return 'mock_tx_digest_' + Date.now();
  }

  /**
   * Create a new Version object on Sui
   * TODO: Implement after Move contract deployment
   */
  async createVersionObject(
    fileId: string,
    walrusBlobId: string,
    owner: string,
    previousVersion: string | null,
    aiSummary?: string
  ): Promise<string> {
    if (!this.packageId) {
      throw new Error('SUI_PACKAGE_ID not configured. Deploy Move contract first.');
    }

    // TODO: Implement actual Move contract call
    console.warn('createVersionObject: Move contract not yet deployed');
    return 'mock_tx_digest_' + Date.now();
  }

  /**
   * Get file object by ID
   * TODO: Implement after Move contract deployment
   */
  async getFileObject(fileId: string): Promise<FileObject | null> {
    console.warn('getFileObject: Not yet implemented');
    return null;
  }

  /**
   * Get version object by ID
   * TODO: Implement after Move contract deployment
   */
  async getVersionObject(versionId: string): Promise<VersionObject | null> {
    console.warn('getVersionObject: Not yet implemented');
    return null;
  }

  /**
   * Get all files owned by an address
   * TODO: Implement after Move contract deployment
   */
  async getFilesByOwner(owner: string): Promise<FileObject[]> {
    console.warn('getFilesByOwner: Not yet implemented');
    return [];
  }

  /**
   * Get version chain for a file
   * TODO: Implement after Move contract deployment
   */
  async getVersionChain(fileId: string): Promise<VersionObject[]> {
    console.warn('getVersionChain: Not yet implemented');
    return [];
  }

  /**
   * Get current block timestamp
   */
  async getCurrentTimestamp(): Promise<number> {
    try {
      // For now, use local timestamp
      // TODO: Get from latest checkpoint when needed
      return Date.now();
    } catch (error) {
      console.error('Error fetching timestamp:', error);
      return Date.now();
    }
  }
}

// Export both the enhanced client and base client
export const suiClientEnhanced = new SuiClient();
export const suiClient = baseSuiClient;
