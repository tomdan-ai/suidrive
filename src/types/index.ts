/**
 * SuiDrive Core Type Definitions
 */

// ============================================================================
// File & Version Types
// ============================================================================

export interface FileObject {
  objectId?: string; // Sui object ID (for querying)
  fileId: string;
  owner: string; // Sui wallet address
  latestVersion: number;
  createdAt: number; // Unix timestamp
  name?: string;
  mimeType?: string;
}

export interface VersionObject {
  versionId: string;
  fileId: string;
  walrusBlobId: string;
  previousVersion: string | null;
  timestamp: number;
  aiSummary?: string;
  size?: number;
  mimeType?: string;
}

// ============================================================================
// Walrus Types
// ============================================================================

export interface WalrusUploadResponse {
  blobId: string;
  suiRef?: string;
  endEpoch?: number;
}

export interface WalrusBlob {
  blobId: string;
  size: number;
  contentType?: string;
}

// ============================================================================
// Sui Types
// ============================================================================

export interface SuiTransactionResult {
  digest: string;
  effects: {
    status: { status: string };
  };
  objectChanges?: Array<{
    type: string;
    objectId: string;
    objectType?: string;
  }>;
}

// ============================================================================
// AI Analysis Types
// ============================================================================

export interface AIAnalysisRequest {
  fileContent?: string;
  fileName: string;
  mimeType: string;
  previousSummary?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  changeDescription?: string;
  insights?: string[];
  provider: 'nvidia' | 'deepseek' | 'openrouter';
}

// ============================================================================
// Upload Flow Types
// ============================================================================

export interface UploadRequest {
  file: File;
  walletAddress: string;
  fileId?: string; // For new versions of existing files
}

export interface UploadProgress {
  stage: 'uploading' | 'blockchain' | 'analyzing' | 'complete';
  progress: number;
  message: string;
}

export interface UploadResult {
  success: boolean;
  fileId: string;
  versionId: string;
  blobId: string;
  transactionDigest: string;
  aiSummary?: string;
  error?: string;
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface UserProfile {
  address: string;
  files: FileObject[];
  totalVersions: number;
}

// ============================================================================
// Sharing Types
// ============================================================================

export type ShareAccess = 'viewer'; // Can be extended to 'editor' in future

export interface ShareGrant {
  /** Recipient wallet address */
  address: string;
  /** Access level */
  access: ShareAccess;
  /** When the share was created */
  grantedAt: number;
  /** For encrypted files: salt to derive decryption key for this recipient */
  encryptionSalt?: string;
}

export interface ShareSettings {
  /** Is the file publicly accessible via link? (only for unencrypted files) */
  isPublic: boolean;
  /** List of wallets that have been granted access */
  grants: ShareGrant[];
  /** Shareable link (for public files) */
  shareLink?: string;
}

// ============================================================================
// UI Types
// ============================================================================

export interface TimelineVersion {
  version: number;
  versionId: string;
  timestamp: number;
  summary?: string;
  blobId: string;
}

export interface FileHistory {
  file: FileObject;
  versions: TimelineVersion[];
}
