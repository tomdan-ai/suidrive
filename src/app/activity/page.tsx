"use client";

import React from 'react';
import Link from 'next/link';
import { Activity, Zap, ExternalLink, ChevronLeft, Cpu } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[#01060b] text-white font-sans flex flex-col">
      <nav className="px-10 py-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[3px]">Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <Activity className="text-cyan-400 animate-pulse" size={20} />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Live Protocol Feed</h1>
        </div>
        <div className="w-10" />
      </nav>

      <main className="p-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center h-[60vh] opacity-40">
        <Cpu size={40} className="mb-6 text-gray-600" />
        <p className="text-[10px] font-bold uppercase tracking-[5px] text-gray-500">Awaiting Network Events...</p>
        <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 w-1/3 animate-[loading_2s_infinite]" />
        </div>
      </main>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}