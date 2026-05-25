/**
 * Upload API Route
 * Handles file uploads via API endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UploadResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const walletAddress = formData.get('walletAddress') as string;
    const fileId = formData.get('fileId') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Phase 1: Mock upload response
    // TODO: Implement full upload flow in Phase 2 with wallet integration
    
    const mockFileId = fileId || `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockBlobId = `blob_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockVersionId = `${mockFileId}_v1`;
    const mockTxDigest = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Try to generate AI summary if it's a text file
    let aiSummary: string | undefined;
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      try {
        const content = await file.text();
        const truncated = content.substring(0, 500);
        aiSummary = `File: ${file.name} (${file.type}). Size: ${(file.size / 1024).toFixed(2)} KB. Preview: ${truncated}...`;
      } catch (error) {
        console.warn('Could not generate summary:', error);
      }
    }

    const result: UploadResult = {
      success: true,
      fileId: mockFileId,
      versionId: mockVersionId,
      blobId: mockBlobId,
      transactionDigest: mockTxDigest,
      aiSummary,
    };

    console.log('✅ Mock upload successful:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      walletAddress,
      result,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
