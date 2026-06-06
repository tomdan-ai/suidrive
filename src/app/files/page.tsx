"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, FileText, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useZkLogin } from '@/contexts/ZkLoginProvider';
import { formatDate, formatBytes } from '@/lib/utils';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
const SPONSOR_ADDRESS = process.env.NEXT_PUBLIC_SUI_SPONSOR_ADDRESS || '';

interface FileItem {
  objectId: string;
  fileId: string;
  name: string;
  mimeType: string;
  createdAt: number;
  versionCount: number;
  totalSize: number;
}

export default function FilesPage() {
  const { address, suiClient: client } = useZkLogin();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !PACKAGE_ID) {
      setLoading(false);
      return;
    }

    async function loadFiles() {
      try {
        const queryOwner = SPONSOR_ADDRESS || address!;

        const fileObjects = await client.getOwnedObjects({
          owner: queryOwner,
          filter: { StructType: `${PACKAGE_ID}::file_object::FileObject` },
          options: { showContent: true },
        });

        const versionObjects = await client.getOwnedObjects({
          owner: queryOwner,
          filter: { StructType: `${PACKAGE_ID}::version_object::VersionObject` },
          options: { showContent: true },
        });

        // Count versions per file
        const versionStats = new Map<string, { count: number; totalSize: number }>();
        for (const obj of versionObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fid = fields.file_id;
            const size = parseInt(fields.size || '0');
            const existing = versionStats.get(fid) || { count: 0, totalSize: 0 };
            versionStats.set(fid, { count: existing.count + 1, totalSize: existing.totalSize + size });
          }
        }

        const fileList: FileItem[] = [];
        for (const obj of fileObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fid = fields.file_id;
            const stats = versionStats.get(fid);
            fileList.push({
              objectId: obj.data.objectId,
              fileId: fid,
              name: fields.name,
              mimeType: fields.mime_type,
              createdAt: parseInt(fields.created_at),
              versionCount: stats?.count || 0,
              totalSize: stats?.totalSize || 0,
            });
          }
        }

        fileList.sort((a, b) => b.createdAt - a.createdAt);
        setFiles(fileList);
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [address, client]);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="text-cyan-400" size={24} />
              All Files & Versions
            </h1>
            <p className="text-sm text-white/40 mt-1">Browse all your files and their version history.</p>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-2 text-xs font-medium w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {files.length} file{files.length !== 1 ? 's' : ''} on-chain
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center">
            <FileText className="text-white/20 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white/60 mb-2">No files yet</h3>
            <p className="text-sm text-white/40 mb-6">Upload your first file to see it here.</p>
            <Link href="/upload" className="btn-watery px-6 py-2.5 rounded-xl text-sm font-semibold text-white inline-block">
              Upload File
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <Link
                key={file.objectId}
                href={`/files/${file.objectId}`}
                className="glass-panel glass-panel-hover rounded-xl p-4 flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shrink-0">
                  <FileText className="text-cyan-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {file.name}
                  </h4>
                  <p className="text-xs text-white/40 mt-0.5">
                    {file.mimeType} · {formatBytes(file.totalSize)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>{file.versionCount} version{file.versionCount !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5">{formatDate(file.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
