"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyFilesPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Files</h1>
          <p className="text-sm text-white/40 mt-1">All your personal files stored permanently on Walrus.</p>
        </div>

        <div className="flex flex-col items-center justify-center h-[50vh] glass-panel rounded-2xl border-dashed border-white/10 p-8 text-center relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            {/* 3D Walrus Mascot */}
            <div className="animate-float mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/15 rounded-full blur-2xl scale-150" />
                <Image
                  src="/Walrus_🦭_idzOnVzcF1_0.png"
                  alt="Walrus"
                  width={80}
                  height={80}
                  className="relative rounded-2xl drop-shadow-[0_0_20px_rgba(0,207,255,0.2)]"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Your Walrus has no blobs yet 🦭</h2>
            <p className="text-white/40 text-sm mb-8 max-w-sm">
              Upload files to store them permanently and securely on the blockchain.
              They will appear here once uploaded.
            </p>
            <Link href="/upload" className="btn-watery px-6 py-3 text-white rounded-xl font-semibold text-sm flex items-center gap-2">
              <Upload size={18} />
              New Upload
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}