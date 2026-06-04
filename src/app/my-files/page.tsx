"use client";

import React from 'react';
import Link from 'next/link';
import { HardDrive, Upload } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyFilesPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-slate-800">My Files</h1>
          <p className="text-sm text-slate-500 mt-1">All your personal files stored permanently on Walrus.</p>
        </div>

        <div className="flex flex-col items-center justify-center h-[50vh] border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <HardDrive size={40} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Your Drive is ready</h2>
          <p className="text-slate-500 text-sm mb-8 max-w-sm">
            Upload files to store them permanently and securely on the blockchain. 
            They will appear here once uploaded.
          </p>
          <Link href="/upload" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Upload size={18} />
            New Upload
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}