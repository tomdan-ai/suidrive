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
