"use client";

import React from 'react';
import Link from 'next/link';
import { History, ChevronLeft, Search, Clock, Database, ShieldCheck, Layers } from 'lucide-react';

export default function VersionsHubPage() {
  return (
    <div className="min-h-screen bg-[#01060b] text-white font-sans selection:bg-cyan-400 overflow-hidden relative flex flex-col">
     
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-10 py-8 max-w-[1600px] mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[3px]">Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <History className="text-cyan-400" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter italic uppercase">Version Hub</span>
        </div>
        <div className="hidden md:block">
           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Sui Network Live</span>
           </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-[1000] italic uppercase tracking-tighter">
            Immutable <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">Timeline.</span>
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[4px] max-w-lg mx-auto leading-loose">
            Accessing the decentralized archive of every state change recorded on the protocol.
          </p>
        </div>

        {/* Placeholder for Global History */}
        <div className="grid gap-6">
          <div className="group bg-[#050b14]/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[40px] flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-cyan-400/30">
             <div className="w-20 h-20 rounded-[30px] bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] group-hover:scale-110 transition-transform">
                <Database className="text-cyan-400" size={36} />
             </div>
             <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-3">Archive Directory Initializing</h3>
             <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-medium">
               The global version history is currently syncing. Please access specific file versions through your
               <Link href="/dashboard" className="text-cyan-400 ml-1 hover:underline font-black italic">Dashboard</Link>.
             </p>
          </div>

          {/* Fake "Loading" entries for visual flair */}
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.01] border border-white/5 opacity-30 grayscale">
               <div className="flex items-center gap-4">
                 <Layers size={20} className="text-gray-600" />
                 <div className="space-y-2">
                    <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-white/5 rounded animate-pulse" />
                 </div>
               </div>
               <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-10 text-center">
         <p className="text-[8px] font-bold text-gray-700 uppercase tracking-[5px]">
            SuiDrive Protocol ● Secure Immutable Permanent
         </p>
      </footer>
    </div>
  );
}