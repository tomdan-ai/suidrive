"use client";

import React from 'react';
import Link from 'next/link';
import { Cloud, ShieldCheck, Zap, Database, ArrowRight, LayoutDashboard, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
    
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-medium text-slate-800 tracking-tight">SuiDrive</span>
        </div>
      
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="text-blue-600">Home</Link>
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/verify" className="hover:text-slate-900 transition-colors">Security</Link>
        </div>

        <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          Go to Drive
        </Link>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-20 pb-16 lg:pt-32 lg:pb-24 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
          A safe place for all your files, <br className="hidden md:block" />
          <span className="text-blue-600">permanently on chain.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          SuiDrive is the decentralized storage layer for the modern web. Store, share, and verify your files forever using Walrus and Sui network.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            <LayoutDashboard size={20} />
            Open Drive
          </Link>
          <Link href="/upload" className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-base hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            <Upload size={20} />
            Upload File
          </Link>
        </div>

        {/* HERO IMAGE / ILLUSTRATION MOCK */}
        <div className="mt-16 w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-4 md:p-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
             <MockFileCard icon={<Database className="text-blue-500" />} name="financial_report.pdf" />
             <MockFileCard icon={<Cloud className="text-blue-500" />} name="project_assets.zip" />
             <MockFileCard icon={<ShieldCheck className="text-green-500" />} name="identity_proof.png" />
             <MockFileCard icon={<Zap className="text-amber-500" />} name="smart_contract.move" />
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <FeatureCard 
            title="Immutable Storage" 
            desc="Every file is stored permanently on Walrus. No link rot, no deleted files."
            icon={<Database size={24} className="text-blue-600" />}
          />
          <FeatureCard 
            title="Verifiable History" 
            desc="A complete, cryptographically secure version history for all your documents."
            icon={<ShieldCheck size={24} className="text-blue-600" />}
          />
          <FeatureCard 
            title="Lightning Fast" 
            desc="Built on Sui for instant finality and blazing fast interactions."
            icon={<Zap size={24} className="text-blue-600" />}
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>Built with Walrus and Sui Network • Immutable File History Protocol</p>
        </div>
      </footer>
    </div>
  );
}

function MockFileCard({ icon, name }: { icon: React.ReactNode, name: string }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
      {icon}
      <span className="text-xs font-medium text-slate-700 truncate">{name}</span>
    </div>
  )
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}