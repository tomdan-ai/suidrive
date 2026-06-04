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
            <h1 className="text-2xl font-medium text-slate-800 flex items-center gap-2">
              <History className="text-slate-500" size={24} />
              Version Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1">Global directory of file states and versions.</p>
          </div>
          <div className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-2 text-xs font-medium w-fit">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Sui Network Live
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-white border border-slate-200 p-10 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
             <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <Database className="text-blue-600" size={32} />
             </div>
             <h3 className="text-xl font-semibold text-slate-800 mb-2">Directory Syncing</h3>
             <p className="text-slate-500 text-sm max-w-md">
               The global version history is currently syncing. Please access specific file versions directly through your 
               <Link href="/dashboard" className="text-blue-600 ml-1 hover:underline font-medium">Drive</Link>.
             </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-50">
             <div className="flex items-center gap-4">
               <Layers size={20} className="text-slate-400" />
               <div className="space-y-2">
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                  <div className="h-2 w-20 bg-slate-200 rounded" />
               </div>
             </div>
             <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}