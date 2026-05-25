/**
 * Upload Page
 * Allows users to upload files to SuiDrive
 */

'use client';

import { useState } from 'react';
import type { UploadProgress, UploadResult } from '@/types';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [walletAddress, setWalletAddress] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !walletAddress) {
      alert('Please select a file and enter wallet address');
      return;
    }

    setUploading(true);
    setProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('walletAddress', walletAddress);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResult = await response.json();

      if (data.success) {
        setResult(data);
        setProgress({ stage: 'complete', progress: 100, message: 'Upload complete!' });
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Upload to <span className="text-blue-400">SuiDrive</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Create immutable file history on Walrus + Sui
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            {/* Wallet Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                disabled={uploading}
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter your Sui wallet address (zkLogin coming soon)
              </p>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select File
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center w-full px-4 py-8 bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition"
                >
                  {file ? (
                    <div className="text-center">
                      <p className="text-blue-400 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400">Click to select a file</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Any file type supported
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !walletAddress || uploading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
            >
              {uploading ? 'Uploading...' : 'Upload to SuiDrive'}
            </button>

            {/* Progress */}
            {progress && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize">{progress.stage}</span>
                  <span>{progress.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{progress.message}</p>
              </div>
            )}

            {/* Result */}
            {result && result.success && (
              <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">
                  ✓ Upload Successful
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-400">File ID:</span>{' '}
                    <code className="text-blue-400">{result.fileId}</code>
                  </p>
                  <p>
                    <span className="text-gray-400">Blob ID:</span>{' '}
                    <code className="text-blue-400">{result.blobId}</code>
                  </p>
                  {result.aiSummary && (
                    <p className="mt-3 pt-3 border-t border-green-800">
                      <span className="text-gray-400">AI Summary:</span>
                      <br />
                      <span className="text-gray-200">{result.aiSummary}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-800/30 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🗄️</div>
              <p className="text-sm text-gray-400">Walrus Storage</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">⛓️</div>
              <p className="text-sm text-gray-400">Sui Blockchain</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm text-gray-400">AI Analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
