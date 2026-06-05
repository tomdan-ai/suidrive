"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { AuthOptions } from '@/components/AuthButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileObject } from '@/types';
import {
  ShieldCheck, MoreVertical, FileText as FileIcon, Clock, Image as ImageIcon,
  FileArchive, FileVideo, HardDrive, Layers, Database, Wifi
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

interface DashboardFile extends FileObject {
  totalSize?: number;
  versionCount?: number;
}

export default function DashboardPage() {
  // --- BOSS'S LOGIC START ---
  const { address, suiClient: client } = useZkLogin();
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'versions'>('newest');

  useEffect(() => {
    if (!address || !PACKAGE_ID) return;

    async function loadFiles() {
      if (!address) return;
      setLoading(true);
      try {
        const fileObjects = await client.getOwnedObjects({
          owner: address,
          filter: { StructType: `${PACKAGE_ID}::file_object::FileObject` },
          options: { showContent: true },
        });

        const versionObjects = await client.getOwnedObjects({
          owner: address,
          filter: { StructType: `${PACKAGE_ID}::version_object::VersionObject` },
          options: { showContent: true },
        });

        const versionStats = new Map<string, { count: number; totalSize: number }>();
        for (const obj of versionObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fileId = fields.file_id;
            const size = parseInt(fields.size || '0');
            const existing = versionStats.get(fileId) || { count: 0, totalSize: 0 };
            versionStats.set(fileId, { count: existing.count + 1, totalSize: existing.totalSize + size });
          }
        }

        const fileList: DashboardFile[] = [];
        for (const obj of fileObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fileId = fields.file_id;
            const stats = versionStats.get(fileId);
            fileList.push({
              objectId: obj.data.objectId,
              fileId,
              owner: fields.owner,
              latestVersion: parseInt(fields.latest_version),
              createdAt: parseInt(fields.created_at),
              name: fields.name,
              mimeType: fields.mime_type,
              versionCount: stats?.count || 0,
              totalSize: stats?.totalSize || 0,
            });
          }
        }
        setFiles(fileList);
      } catch (error) { console.error('Failed to load files:', error); }
      finally { setLoading(false); }
    }
    loadFiles();
  }, [address, client]);

  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => f.name?.toLowerCase().includes(q) || f.fileId.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'oldest': result.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'name': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'versions': result.sort((a, b) => (b.versionCount || 0) - (a.versionCount || 0)); break;
    }
    return result;
  }, [files, searchQuery, sortBy]);

  const totalStorage = files.reduce((sum, f) => sum + (f.totalSize || 0), 0);
  const totalVersions = files.reduce((sum, f) => sum + (f.versionCount || 0), 0);
  // --- BOSS'S LOGIC END ---

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">My Drive</h1>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-medium text-white/60 outline-none hover:bg-white/10 transition-colors cursor-pointer"
            >
              <option value="newest">Last modified</option>
              <option value="name">Name</option>
              <option value="versions">Versions</option>
            </select>
          </div>
        </div>

        {!address ? (
          <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[60vh]">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 animate-glow">
              <Image src="/Walrus_🦭_idzOnVzcF1_0.png" alt="Walrus" width={40} height={40} className="rounded-lg" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to your Drive</h2>
            <p className="text-white/40 mb-8 max-w-sm">Connect a wallet or sign in with Google to access your permanent decentralized storage.</p>
            <AuthOptions />
          </div>
        ) : loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/40 text-sm font-medium">Syncing from Walrus...</p>
          </div>
        ) : (
          <>
            {/* STATS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Files" value={files.length} icon={<Database size={16} className="text-cyan-400" />} />
              <StatCard label="Storage Used" value={formatBytes(totalStorage)} icon={<HardDrive size={16} className="text-blue-400" />} />
              <StatCard label="Total Versions" value={totalVersions} icon={<Layers size={16} className="text-purple-400" />} />
              <StatCard label="Network" value="Sui Testnet" icon={<Wifi size={16} className="text-emerald-400" />} />
            </div>

            {/* SUGGESTED */}
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Suggested</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {filteredFiles.slice(0, 4).map(file => (
                <SuggestedCard key={file.fileId} file={file} />
              ))}
              {filteredFiles.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/30 text-sm glass-panel rounded-xl border border-dashed border-white/10">
                  <Image src="/Walrus_🦭_idzOnVzcF1_0.png" alt="Walrus" width={48} height={48} className="mx-auto mb-3 opacity-30 rounded-lg" />
                  No files yet. Upload a file to get started.
                </div>
              )}
            </div>

            {/* FILE LIST */}
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Files</h2>
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-semibold text-white/30 uppercase tracking-wider">
                <div className="col-span-6 md:col-span-5">Name</div>
                <div className="col-span-3 hidden md:block">Owner</div>
                <div className="col-span-4 md:col-span-2">Last modified</div>
                <div className="col-span-2 text-right">File size</div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredFiles.map(file => (
                  <FileListItem key={file.fileId} file={file} />
                ))}
                {filteredFiles.length === 0 && (
                  <div className="p-8 text-center text-sm text-white/30">
                    Your drive is empty
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col gap-1">
      <div className="text-xs font-medium text-white/40 flex justify-between items-center">
        {label}
        {icon}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function SuggestedCard({ file }: { file: DashboardFile }) {
  const getIcon = (mime: string, size: number = 40) => {
    if (mime.includes('image')) return <ImageIcon size={size} className="text-cyan-400" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive size={size} className="text-amber-400" />;
    if (mime.includes('video')) return <FileVideo size={size} className="text-rose-400" />;
    return <FileIcon size={size} className="text-blue-400" />;
  };

  return (
    <Link href={`/files/${file.objectId}`} className="glass-panel glass-panel-hover rounded-xl p-4 flex flex-col group">
      <div className="flex-1 flex items-center justify-center py-6 bg-white/[0.02] rounded-lg mb-3 group-hover:bg-cyan-500/5 transition-colors border border-white/5">
        {getIcon(file.mimeType || '')}
      </div>
      <div className="flex items-start gap-2">
        {getIcon(file.mimeType || '', 16)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate group-hover:text-cyan-400 transition-colors">{file.name || 'Untitled'}</p>
          <p className="text-xs text-white/30 truncate">{file.versionCount || 0} versions</p>
        </div>
      </div>
    </Link>
  );
}

function FileListItem({ file }: { file: DashboardFile }) {
  const getIcon = (mime: string) => {
    if (mime.includes('image')) return <ImageIcon size={20} className="text-cyan-400" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive size={20} className="text-amber-400" />;
    if (mime.includes('video')) return <FileVideo size={20} className="text-rose-400" />;
    return <FileIcon size={20} className="text-blue-400" />;
  };

  return (
    <Link href={`/files/${file.objectId}`} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-white/[0.03] transition-colors group cursor-pointer">
      <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
        {getIcon(file.mimeType || '')}
        <span className="text-sm font-medium text-white/70 truncate group-hover:text-cyan-400 transition-colors">{file.name || 'Untitled'}</span>
      </div>
      <div className="col-span-3 hidden md:flex items-center gap-2 text-sm text-white/40 truncate">
        <div className="w-5 h-5 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 text-[10px] shrink-0">me</div>
        <span className="truncate">me</span>
      </div>
      <div className="col-span-4 md:col-span-2 text-sm text-white/40 truncate">
        {formatDate(file.createdAt)}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-4 text-sm text-white/40">
        <span className="truncate">{formatBytes(file.totalSize || 0)}</span>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/40 transition-all shrink-0">
          <MoreVertical size={16} />
        </button>
      </div>
    </Link>
  );
}
