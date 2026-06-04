"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { AuthOptions } from '@/components/AuthButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileObject } from '@/types';
import {
  ShieldCheck, MoreVertical, FileText as FileIcon, Clock, Image as ImageIcon,
  FileArchive, FileVideo, HardDrive
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
          <h1 className="text-2xl font-medium text-slate-800">My Drive</h1>
          
          {/* Quick Filters / View Options (Decorative for now to match Drive feel) */}
          <div className="flex items-center gap-3">
             <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 transition-colors shadow-sm"
             >
               <option value="newest">Last modified</option>
               <option value="name">Name</option>
               <option value="versions">Versions</option>
             </select>
          </div>
        </div>

        {!address ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm h-[60vh]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-medium text-slate-800 mb-2">Sign in to your Drive</h2>
            <p className="text-slate-500 mb-8 max-w-sm">Connect a wallet or sign in with Google to access your permanent decentralized storage.</p>
            <AuthOptions />
          </div>
        ) : loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Syncing files...</p>
          </div>
        ) : (
          <>
            {/* STATS STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Files" value={files.length} />
              <StatCard label="Storage Used" value={formatBytes(totalStorage)} />
              <StatCard label="Total Versions" value={totalVersions} />
              <StatCard label="Network" value="Sui Mainnet" icon={<ShieldCheck size={16} className="text-green-500" />} />
            </div>

            {/* FOLDERS / SUGGESTED (mock layout to feel like Drive) */}
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Suggested</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {filteredFiles.slice(0, 4).map(file => (
                <SuggestedCard key={file.fileId} file={file} />
              ))}
              {filteredFiles.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500 text-sm bg-white border border-dashed border-slate-300 rounded-xl">
                  No files yet. Upload a file to get started.
                </div>
              )}
            </div>

            {/* FILE LIST */}
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Files</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <div className="col-span-6 md:col-span-5">Name</div>
                <div className="col-span-3 hidden md:block">Owner</div>
                <div className="col-span-4 md:col-span-2">Last modified</div>
                <div className="col-span-2 text-right">File size</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredFiles.map(file => (
                  <FileListItem key={file.fileId} file={file} />
                ))}
                {filteredFiles.length === 0 && (
                   <div className="p-8 text-center text-sm text-slate-500">
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
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-1">
      <div className="text-xs font-medium text-slate-500 flex justify-between items-center">
        {label}
        {icon}
      </div>
      <div className="text-xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SuggestedCard({ file }: { file: DashboardFile }) {
  const getIcon = (mime: string, size: number = 40) => {
    if (mime.includes('image')) return <ImageIcon size={size} className="text-blue-500" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive size={size} className="text-amber-500" />;
    if (mime.includes('video')) return <FileVideo size={size} className="text-red-500" />;
    return <FileIcon size={size} className="text-blue-600" />;
  };

  return (
    <Link href={`/files/${file.objectId}`} className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl p-4 flex flex-col group">
      <div className="flex-1 flex items-center justify-center py-6 bg-slate-50 rounded-lg mb-3 group-hover:bg-blue-50/50 transition-colors">
        {getIcon(file.mimeType || '')}
      </div>
      <div className="flex items-start gap-2">
         {getIcon(file.mimeType || '', 16)}
         <div className="flex-1 min-w-0">
           <p className="text-sm font-medium text-slate-800 truncate">{file.name || 'Untitled'}</p>
           <p className="text-xs text-slate-500 truncate">You opened just now</p>
         </div>
      </div>
    </Link>
  );
}

function FileListItem({ file }: { file: DashboardFile }) {
  const getIcon = (mime: string) => {
    if (mime.includes('image')) return <ImageIcon size={20} className="text-blue-500" />;
    if (mime.includes('zip') || mime.includes('archive')) return <FileArchive size={20} className="text-amber-500" />;
    if (mime.includes('video')) return <FileVideo size={20} className="text-red-500" />;
    return <FileIcon size={20} className="text-blue-600" />;
  };

  return (
    <Link href={`/files/${file.objectId}`} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
        {getIcon(file.mimeType || '')}
        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{file.name || 'Untitled'}</span>
      </div>
      <div className="col-span-3 hidden md:flex items-center gap-2 text-sm text-slate-600 truncate">
        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] shrink-0">me</div>
        <span className="truncate">me</span>
      </div>
      <div className="col-span-4 md:col-span-2 text-sm text-slate-600 truncate">
        {formatDate(file.createdAt)}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-4 text-sm text-slate-600">
        <span className="truncate">{formatBytes(file.totalSize || 0)}</span>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-500 transition-all shrink-0">
          <MoreVertical size={16} />
        </button>
      </div>
    </Link>
  );
}
