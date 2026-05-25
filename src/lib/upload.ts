/**
 * Core Upload Flow
 * Orchestrates file upload to Walrus, blockchain recording, and AI analysis
 */

import { walrusClient } from './walrus/client';
import { suiClientEnhanced } from './sui/client';
import { analyzeFile } from './ai/analyze';
import { generateFileId, generateVersionId, readFileAsText } from './utils';
import type { UploadRequest, UploadResult, UploadProgress } from '@/types';

/**
 * Upload a file and create version history
 */
export async function uploadFile(
  request: UploadRequest,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const { file, walletAddress, fileId: existingFileId } = request;

  try {
    // Generate IDs
    const fileId = existingFileId || generateFileId();
    const version = 1; // TODO: Get actual version number from chain
    const versionId = generateVersionId(fileId, version);

    // Step 1: Upload to Walrus
    onProgress?.({
      stage: 'uploading',
      progress: 25,
      message: 'Uploading to Walrus...',
    });

    const { blobId, suiRef } = await walrusClient.uploadFile(file);

    // Step 2: Record on Sui blockchain
    onProgress?.({
      stage: 'blockchain',
      progress: 50,
      message: 'Recording on Sui blockchain...',
    });

    // Create file object if new file
    if (!existingFileId) {
      await suiClientEnhanced.createFileObject(
        walletAddress,
        fileId,
        file.name,
        file.type
      );
    }

    // Create version object
    const transactionDigest = await suiClientEnhanced.createVersionObject(
      fileId,
      blobId,
      walletAddress,
      null, // TODO: Get previous version ID if updating
      undefined // AI summary will be added after analysis
    );

    // Step 3: AI Analysis
    onProgress?.({
      stage: 'analyzing',
      progress: 75,
      message: 'Analyzing file with AI...',
    });

    let aiSummary: string | undefined;
    try {
      const fileContent = await readFileAsText(file);
      if (fileContent) {
        const analysis = await analyzeFile({
          fileName: file.name,
          mimeType: file.type,
          fileContent,
        });
        aiSummary = analysis.summary;
      }
    } catch (error) {
      console.warn('AI analysis failed:', error);
      // Continue without AI summary
    }

    // Step 4: Complete
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!',
    });

    return {
      success: true,
      fileId,
      versionId,
      blobId,
      transactionDigest,
      aiSummary,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      success: false,
      fileId: '',
      versionId: '',
      blobId: '',
      transactionDigest: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a new version of an existing file
 */
export async function uploadNewVersion(
  file: File,
  fileId: string,
  walletAddress: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // TODO: Get previous version info from chain
  // TODO: Pass previous AI summary for comparison

  return uploadFile(
    {
      file,
      walletAddress,
      fileId,
    },
    onProgress
  );
}
