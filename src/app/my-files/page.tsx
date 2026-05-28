"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, ChevronLeft, Search, Filter, HardDrive } from 'lucide-react';

export default function MyFilesPage() {
  return (
    <div className="min-h-screen bg-[#01060b] text-white font-sans selection:bg-cyan-400 overflow-hidden relative flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1600px] mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[3px]">Back</span>
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="text-cyan-400" size={24} />
          <span className="text-2xl font-black tracking-tighter italic uppercase">My Archives</span>
        </div>
        <div className="w-20" />
      </nav>

      <main className="relative z-10 flex-1 max-w-[1200px] mx-auto w-full px-6 py-10">
        <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
          <HardDrive size={48} className="text-gray-700 mb-6" />
          <h2 className="text-2xl font-black italic uppercase">Vault Initialized</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Your immutable storage is active and ready.</p>
          <Link href="/upload" className="mt-8 px-8 py-3 bg-cyan-400 text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            Archive First File
          </Link>
        </div>
      </main>
    </div>
  );
}