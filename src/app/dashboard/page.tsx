"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiClient } from '@/hooks/useSuiClient';
import { WalletButton } from '@/components/WalletButton';
import { formatDate, formatBytes } from '@/lib/utils';
import type { FileObject } from '@/types';
import {
  LayoutDashboard, FileText, History, Share2,
  Activity, Star, Trash2, Search, Bell,
  Upload, Cloud, ShieldCheck, MoreHorizontal,
  ChevronRight, Globe, Zap, HardDrive, Circle
} from 'lucide-react';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

interface DashboardFile extends FileObject {
  totalSize?: number;
  versionCount?: number;
}

export default function DashboardPage() {
  // --- BOSS'S LOGIC START ---
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'versions'>('newest');

  useEffect(() => {
    if (!account || !PACKAGE_ID) return;

    async function loadFiles() {
      if (!account) return;
      setLoading(true);
      try {
        const fileObjects = await client.getOwnedObjects({
          owner: account.address,
          filter: { StructType: `${PACKAGE_ID}::file_object::FileObject` },
          options: { showContent: true },
        });

        const versionObjects = await client.getOwnedObjects({
          owner: account.address,
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
  }, [account, client]);

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
    <div className="min-h-screen bg-[#01060b] text-white font-sans selection:bg-cyan-400 selection:text-black flex overflow-hidden">
     
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 bg-[#020A14]/80 backdrop-blur-3xl p-6 flex flex-col z-50">
        <Link href="/" className="flex items-center gap-3 mb-10 px-2 cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <span className="text-black font-black text-xl italic">S</span>
          </div>
          <span className="text-2xl font-black tracking-tighter italic">SuiDrive</span>
        </Link>

        <nav className="...">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active
            href="/dashboard"
          />
          <NavItem
            icon={<FileText size={18} />}
            label="My Files"
            href="/my-files"
          />
          <NavItem
            icon={<History size={18} />}
            label="Versions"
            href="/files"
          />
          <NavItem
            icon={<Activity size={18} />}
            label="Activity"
            href="/activity"
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[3px] mb-4 text-center">Protocol Stats</p>
          <div className="space-y-2">
            <SidebarStat label="Storage" value={formatBytes(totalStorage)} />
            <SidebarStat label="Network" value="Sui Mainnet" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="px-10 py-6 flex items-center justify-between sticky top-0 bg-[#01060b]/50 backdrop-blur-md z-40">
          <div>
            <h2 className="text-3xl font-black tracking-tight italic uppercase">Dashboard</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Immutable Universe Management</p>
          </div>

          {/* HOLOGRAPHIC SEARCH ENGINE */}
          <div className="flex items-center gap-4">
            <div className={`relative flex items-center transition-all duration-500 ease-out ${searchQuery ? 'w-80' : 'w-48'} group`}>
              <Search
                size={18}
                className={`absolute left-3 z-10 transition-colors duration-300 ${searchQuery ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archives, IDs, versions..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium transition-all duration-500 outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 focus:ring-1 focus:ring-cyan-400/20 placeholder:text-gray-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-[10px] font-black text-gray-500 hover:text-white transition-colors"
                >
                  ESC
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <WalletButton />
            <Link href="/upload" className="bg-cyan-400 text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <Upload size={16} /> Upload
            </Link>
          </div>
        </header>

        <div className="px-10 pb-10">
          {!account ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 mb-6 bg-cyan-400/10 rounded-full flex items-center justify-center border border-cyan-400/20">
                <ShieldCheck size={48} className="text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black italic uppercase mb-2">Wallet Disconnected</h2>
              <p className="text-gray-500 mb-8 max-w-sm">Please connect your Sui wallet to access your permanent storage vault.</p>
              <WalletButton />
            </div>
          ) : loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center">
               <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Indexing Blockchain...</p>
            </div>
          ) : (
            <>
              {/* STATS TILES */}
              <div className="grid grid-cols-4 gap-6 mb-10">
                <StatusStat label="Total Files" value={files.length} />
                <StatusStat label="Versions" value={totalVersions} />
                <StatusStat label="Capacity" value={formatBytes(totalStorage)} color="text-cyan-400" />
                <StatusStat label="Network" value="Active" color="text-green-500" />
              </div>

              {/* UPLOAD HERO AREA */}
              <div className="grid grid-cols-12 gap-8">
                <Link href="/upload" className="col-span-4 group cursor-pointer">
                  <div className="h-[450px] w-full p-[1px] rounded-[40px] bg-gradient-to-br from-cyan-400/50 via-transparent to-blue-600/50">
                    <div className="h-full w-full bg-[#050b14]/90 backdrop-blur-3xl rounded-[39px] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden transition-all group-hover:bg-[#07111d]/90">
                      <Cloud size={60} className="text-cyan-400 opacity-20 animate-bounce mb-4" />
                      <h3 className="text-2xl font-black uppercase italic text-center">Permanent<br/>Upload</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Drop files here</p>
                    </div>
                  </div>
                </Link>

                {/* FILE GRID */}
                <div className="col-span-8 flex flex-col gap-6">
                   <div className="flex justify-between items-center px-2">
                     <h3 className="text-xl font-black uppercase italic">Recent Archives</h3>
                     <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold uppercase text-gray-400 outline-none"
                     >
                       <option value="newest">Newest</option>
                       <option value="versions">Versions</option>
                       <option value="name">Name</option>
                     </select>
                   </div>
                  
                   <div className="grid grid-cols-2 gap-6">
                      {filteredFiles.map((file) => (
                        <FileCard key={file.fileId} file={file} />
                      ))}
                   </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(34, 211, 238, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active = false, href = "#" }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all group ${active ? 'bg-cyan-400/10 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
        <div className="group-hover:text-cyan-400 transition-colors">{icon}</div>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
    </Link>
  );
}

function SidebarStat({ label, value }: any) {
  return (
    <div className="flex justify-between items-center px-2 py-1">
      <span className="text-[10px] text-gray-600 font-bold uppercase">{label}</span>
      <span className="text-[10px] text-white font-mono font-bold">{value}</span>
    </div>
  );
}

function StatusStat({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[3px] mb-1">{label}</p>
      <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}

function FileCard({ file }: { file: DashboardFile }) {
  return (
    <Link
      href={`/files/${file.objectId}`}
      className="relative z-50 block w-full transition-transform active:scale-95"
    >
      <div className="glass-card rounded-[32px] p-6 group cursor-pointer relative overflow-hidden border border-white/5 hover:border-cyan-400/50 bg-[#050b14]/50">
        <div className="flex justify-between items-start mb-4 pointer-events-none">
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-black text-white truncate group-hover:text-cyan-400 transition-colors uppercase italic">
              {file.name || 'Unnamed'}
            </h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">
              {file.mimeType || 'Blob'}
            </p>
          </div>
          <div className="bg-cyan-400/10 px-2 py-1 rounded text-[8px] font-mono text-cyan-400 uppercase">
             {file.versionCount} VER
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 pointer-events-none">
           <div className="flex items-center gap-2">
             <ShieldCheck size={12} className="text-green-500" />
             <span className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Onchain Verified</span>
           </div>
           <span className="text-[9px] text-gray-600 font-bold">{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
