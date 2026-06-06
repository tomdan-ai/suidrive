/**
 * File History Hook
 * Fetches file and version history from Sui
 */

'use client';

import { useState, useEffect } from 'react';
import { useSuiClient } from './useSuiClient';
import type { FileObject, VersionObject, FileHistory } from '@/types';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

export function useFileHistory(fileObjectId: string) {
  const client = useSuiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileHistory, setFileHistory] = useState<FileHistory | null>(null);

  useEffect(() => {
    if (!fileObjectId || !PACKAGE_ID) {
      setLoading(false);
      return;
    }

    async function loadFileHistory() {
      try {
        setLoading(true);
        setError(null);

        // Get file object
        const fileObject = await client.getObject({
          id: fileObjectId,
          options: {
            showContent: true,
            showOwner: true,
          },
        });

        if (!fileObject.data || !fileObject.data.content || fileObject.data.content.dataType !== 'moveObject') {
          throw new Error('File object not found');
        }

        const fields = fileObject.data.content.fields as any;
        
        // Get actual on-chain owner (who the object was transferred to)
        // This differs from fields.owner which is the transaction sender (sponsor)
        let actualOwner = fields.owner;
        if (fileObject.data.owner && typeof fileObject.data.owner === 'object' && 'AddressOwner' in fileObject.data.owner) {
          actualOwner = fileObject.data.owner.AddressOwner;
        }

        const file: FileObject = {
          objectId: fileObject.data.objectId,
          fileId: fields.file_id,
          owner: actualOwner,
          latestVersion: parseInt(fields.latest_version),
          createdAt: parseInt(fields.created_at),
          name: fields.name,
          mimeType: fields.mime_type,
        };

        // Get all version objects for this file
        // Query owned objects by the actual on-chain owner
        const ownedObjects = await client.getOwnedObjects({
          owner: actualOwner,
          filter: {
            StructType: `${PACKAGE_ID}::version_object::VersionObject`,
          },
          options: {
            showContent: true,
          },
        });

        // Filter versions that belong to this file and parse them
        const versions: VersionObject[] = [];
        
        for (const obj of ownedObjects.data) {
          if (obj.data && obj.data.content && obj.data.content.dataType === 'moveObject') {
            const versionFields = obj.data.content.fields as any;
            
            // Check if this version belongs to our file
            if (versionFields.file_id === file.fileId) {
              versions.push({
                versionId: versionFields.version_id,
                fileId: versionFields.file_id,
                walrusBlobId: versionFields.walrus_blob_id,
                previousVersion: versionFields.previous_version || null,
                timestamp: parseInt(versionFields.timestamp),
                aiSummary: versionFields.ai_summary,
                size: parseInt(versionFields.size),
              });
            }
          }
        }

        // Sort versions by timestamp (oldest first)
        versions.sort((a, b) => a.timestamp - b.timestamp);

        setFileHistory({
          file,
          versions: versions.map((v, index) => ({
            version: index + 1,
            versionId: v.versionId,
            timestamp: v.timestamp,
            summary: v.aiSummary,
            blobId: v.walrusBlobId,
          })),
        });
      } catch (err) {
        console.error('Error loading file history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file history');
      } finally {
        setLoading(false);
      }
    }

    loadFileHistory();
  }, [fileObjectId, client]);

  return { fileHistory, loading, error };
}
