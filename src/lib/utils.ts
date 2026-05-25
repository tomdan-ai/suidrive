/**
 * Utility functions for SuiDrive
 */

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate wallet address for display
 */
export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate unique version ID
 */
export function generateVersionId(fileId: string, version: number): string {
  return `${fileId}_v${version}`;
}

/**
 * Extract file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is text-based (for AI analysis)
 */
export function isTextFile(mimeType: string): boolean {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript' ||
    mimeType === 'application/xml' ||
    mimeType.includes('markdown')
  );
}

/**
 * Read file as text (for AI analysis)
 */
export async function readFileAsText(file: File): Promise<string | null> {
  if (!isTextFile(file.type)) return null;

  try {
    return await file.text();
  } catch {
    return null;
  }
}

/**
 * Validate Sui address format
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Create Walrus blob URL
 */
export function getWalrusBlobUrl(blobId: string, aggregatorUrl?: string): string {
  const baseUrl = aggregatorUrl || 'https://aggregator.walrus-testnet.walrus.space';
  return `${baseUrl}/v1/${blobId}`;
}
