/**
 * Share Dialog Component
 * Google Drive-style sharing modal with public link + wallet-based access
 */

'use client';

import { useState } from 'react';
import { isValidSuiAddress } from '@/lib/utils';
import type { ShareGrant } from '@/types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  blobId: string;
  fileName: string;
  mimeType?: string;
  isEncrypted: boolean;
  ownerAddress: string;
  existingGrants?: ShareGrant[];
  onGrantsUpdated?: (grants: ShareGrant[]) => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  blobId,
  fileName,
  mimeType,
  isEncrypted,
  ownerAddress,
  existingGrants = [],
  onGrantsUpdated,
}: ShareDialogProps) {
  const [grants, setGrants] = useState<ShareGrant[]>(existingGrants);
  const [newAddress, setNewAddress] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkType, setLinkType] = useState<'public' | 'restricted'>(
    isEncrypted ? 'restricted' : 'public'
  );

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${encodeURIComponent(blobId)}${mimeType ? `?type=${encodeURIComponent(mimeType)}` : ''}${fileName ? `${mimeType ? '&' : '?'}name=${encodeURIComponent(fileName)}` : ''}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPerson = () => {
    setAddressError(null);
    const trimmed = newAddress.trim();

    if (!trimmed) return;

    if (!isValidSuiAddress(trimmed)) {
      setAddressError('Invalid Sui wallet address (must be 0x followed by 64 hex chars)');
      return;
    }

    if (trimmed.toLowerCase() === ownerAddress.toLowerCase()) {
      setAddressError('That\'s your own address');
      return;
    }

    if (grants.some((g) => g.address.toLowerCase() === trimmed.toLowerCase())) {
      setAddressError('Already shared with this address');
      return;
    }

    const newGrant: ShareGrant = {
      address: trimmed,
      access: 'viewer',
      grantedAt: Date.now(),
    };

    const updated = [...grants, newGrant];
    setGrants(updated);
    setNewAddress('');
    onGrantsUpdated?.(updated);

    // Store grants in localStorage per file
    localStorage.setItem(`suidrive:shares:${blobId}`, JSON.stringify(updated));
  };

  const handleRemovePerson = (address: string) => {
    const updated = grants.filter((g) => g.address !== address);
    setGrants(updated);
    onGrantsUpdated?.(updated);
    localStorage.setItem(`suidrive:shares:${blobId}`, JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Share &quot;{fileName}&quot;</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Add people section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add people (Sui wallet address)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => { setNewAddress(e.target.value); setAddressError(null); }}
                placeholder="0x..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono focus:border-blue-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
              />
              <button
                onClick={handleAddPerson}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition"
              >
                Add
              </button>
            </div>
            {addressError && (
              <p className="text-xs text-red-400 mt-1">{addressError}</p>
            )}
          </div>

          {/* People with access */}
          {grants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">People with access</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {/* Owner */}
                <div className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      You
                    </div>
                    <div>
                      <p className="text-sm font-mono text-gray-300">
                        {ownerAddress.slice(0, 8)}...{ownerAddress.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">Owner</p>
                    </div>
                  </div>
                </div>

                {/* Shared people */}
                {grants.map((grant) => (
                  <div key={grant.address} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                        👤
                      </div>
                      <div>
                        <p className="text-sm font-mono text-gray-300">
                          {grant.address.slice(0, 8)}...{grant.address.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{grant.access}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePerson(grant.address)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link sharing section */}
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">General access</h3>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as 'public' | 'restricted')}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                disabled={isEncrypted}
              >
                <option value="public">Anyone with the link</option>
                <option value="restricted">Only people added above</option>
              </select>
            </div>

            {isEncrypted && (
              <p className="text-xs text-yellow-500 mb-2">
                🔒 This file is encrypted. Only people you share with (and you) can decrypt it.
              </p>
            )}

            {linkType === 'public' && !isEncrypted && (
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs font-mono text-gray-400 truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition whitespace-nowrap"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
