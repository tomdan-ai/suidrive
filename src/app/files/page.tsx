"use client";

import React from 'react';
import Link from 'next/link';
import { History, Database, Layers } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function VersionsHubPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="text-cyan-400" size={24} />
              Version Hub
            </h1>
            <p className="text-sm text-white/40 mt-1">Global directory of file states and versions.</p>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-2 text-xs font-medium w-fit">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Sui Network Live
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 animate-glow mx-auto">
                <Database className="text-cyan-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Directory Syncing</h3>
              <p className="text-white/40 text-sm max-w-md">
                The global version history is currently syncing. Please access specific file versions directly through your
                <Link href="/dashboard" className="text-cyan-400 ml-1 hover:underline font-medium">Drive</Link>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl glass-panel opacity-40">
            <div className="flex items-center gap-4">
              <Layers size={20} className="text-white/20" />
              <div className="space-y-2">
                <div className="h-3 w-32 bg-white/5 rounded" />
                <div className="h-2 w-20 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-6 w-24 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}