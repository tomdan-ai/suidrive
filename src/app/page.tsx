"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Zap, Database, LayoutDashboard, Upload, BookOpen, ExternalLink, Lock, ArrowDown } from 'lucide-react';

function GithubIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#02060f] text-white font-sans flex flex-col selection:bg-cyan-900 selection:text-cyan-200 overflow-x-hidden">

      {/* ===== AMBIENT BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[5%] left-[15%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,180,216,0.07)_0%,transparent_65%)] animate-watery-1" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,119,182,0.06)_0%,transparent_65%)] animate-watery-2" />
        <div className="absolute top-[60%] left-[50%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(144,224,239,0.04)_0%,transparent_65%)] animate-watery-1" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 bg-[#02060f]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 relative">
        <Link href="/" className="flex items-center">
          <Image src="/suidrive.png" alt="SuiDrive" width={64} height={64} className="rounded-xl" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <Link href="/" className="text-cyan-400">Home</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Features</Link>
          <Link href="/verify" className="hover:text-white transition-colors">Verify</Link>
          <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
            <GithubIcon size={14} />
            GitHub
          </a>
        </div>

        <Link href="/dashboard" className="btn-watery px-5 py-2.5 text-white rounded-xl font-semibold text-sm flex items-center gap-2">
          Go to Drive
        </Link>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-16 pb-8 lg:pt-24 lg:pb-12 max-w-6xl mx-auto relative z-10">

        {/* Open Source badge */}
        <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-white/60 hover:border-cyan-500/30 hover:text-cyan-400 transition-all mb-8 group">
          <GithubIcon size={13} />
          <span>Open Source on GitHub</span>
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Large SuiDrive Logo */}
        <div className="mb-8">
          <Image src="/suidrive.png" alt="SuiDrive" width={280} height={280} className="rounded-3xl drop-shadow-[0_0_60px_rgba(0,207,255,0.3)]" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-white">Permanent file storage</span>
          <br className="hidden md:block" />
          <span className="text-white">on the </span>
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">decentralized web.</span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-2xl mb-10 leading-relaxed">
          Upload, version, and verify files forever. Every upload becomes a content-addressed blob on Walrus with an immutable audit trail on Sui.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto btn-watery px-8 py-3.5 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2">
            <LayoutDashboard size={20} />
            Open Drive
          </Link>
          <Link href="/upload" className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white/80 rounded-xl font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
            <Upload size={20} />
            Upload File
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 animate-bounce opacity-30">
          <ArrowDown size={20} />
        </div>

        {/* ===== HERO VISUAL ===== */}
        <div className="mt-8 w-full max-w-4xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent rounded-3xl blur-3xl scale-110" />

          <div className="relative glass-panel rounded-3xl p-6 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(0,207,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Walrus Mascot — using the crypto logo version */}
              <div className="animate-float shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl scale-125" />
                  <Image
                    src="/Walrus_🦭_crypto-logo-wal-png_4.png"
                    alt="Walrus Protocol"
                    width={140}
                    height={140}
                    className="relative rounded-2xl drop-shadow-[0_0_30px_rgba(0,207,255,0.3)]"
                  />
                </div>
              </div>

              {/* Mock File Cards */}
              <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                <MockFileCard icon={<Database className="text-cyan-400" size={18} />} name="financial_report.pdf" status="verified" />
                <MockFileCard icon={<Lock className="text-blue-400" size={18} />} name="encrypted_assets.zip" status="encrypted" />
                <MockFileCard icon={<ShieldCheck className="text-emerald-400" size={18} />} name="identity_proof.png" status="verified" />
                <MockFileCard icon={<Zap className="text-amber-400" size={18} />} name="smart_contract.move" status="on-chain" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== POWERED BY SECTION ===== */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Powered by</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/Sui_crypto-logo-sui-png_4.png" alt="Sui" width={28} height={28} className="rounded" />
              <span className="text-sm font-semibold text-white/70">Sui</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/Walrus_🦭_crypto-logo-wal-png_4.png" alt="Walrus" width={28} height={28} className="rounded" />
              <span className="text-sm font-semibold text-white/70">Walrus</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
              <Image src="/tatum.svg" alt="Tatum" width={28} height={28} />
              <span className="text-sm font-semibold text-white/70">Tatum</span>
            </div>
          </div>
        </div>

        {/* ===== FEATURES GRID ===== */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <FeatureCard
            title="Immutable Storage"
            desc="Every file is stored permanently on Walrus. Content-addressed blobs ensure no link rot, no silent mutations."
            icon={<Database size={24} className="text-cyan-400" />}
          />
          <FeatureCard
            title="Verifiable History"
            desc="A complete, cryptographically secure version history anchored as Move objects on Sui blockchain."
            icon={<ShieldCheck size={24} className="text-emerald-400" />}
          />
          <FeatureCard
            title="Lightning Fast"
            desc="Built on Sui for instant finality and Tatum's enterprise-grade RPC for reliable interactions."
            icon={<Zap size={24} className="text-amber-400" />}
          />
        </div>

        {/* ===== OPEN SOURCE BANNER ===== */}
        <div className="mt-24 w-full glass-panel rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <GithubIcon size={28} className="text-white/60" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Open Source</h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Fully open source. Explore the code, contribute, or fork it for your own project.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer"
                className="btn-watery px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 text-white">
                <GithubIcon size={18} />
                View on GitHub
                <ExternalLink size={14} />
              </a>
              <a href="https://github.com/tomdan-ai/suidrive/blob/main/README.md" target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2">
                <BookOpen size={18} />
                Read the Docs
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER (larger with background image) ===== */}
      <footer className="relative z-10 mt-16">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image src="/background.png" alt="" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02060f] via-[#02060f]/90 to-transparent" />
        </div>

        <div className="relative z-10 border-t border-white/5 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Footer top */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
              {/* Brand */}
              <div className="flex flex-col gap-4">
                <Image src="/suidrive.png" alt="SuiDrive" width={56} height={56} className="rounded-xl" />
                <p className="text-sm text-white/40 max-w-xs">
                  Immutable file history protocol. Permanent, verifiable storage on the decentralized web.
                </p>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                <div>
                  <h4 className="font-semibold text-white/70 mb-3">Product</h4>
                  <div className="space-y-2 text-white/40">
                    <Link href="/dashboard" className="block hover:text-cyan-400 transition-colors">Dashboard</Link>
                    <Link href="/upload" className="block hover:text-cyan-400 transition-colors">Upload</Link>
                    <Link href="/verify" className="block hover:text-cyan-400 transition-colors">Verify</Link>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white/70 mb-3">Developers</h4>
                  <div className="space-y-2 text-white/40">
                    <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer" className="block hover:text-cyan-400 transition-colors">GitHub</a>
                    <a href="https://github.com/tomdan-ai/suidrive/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="block hover:text-cyan-400 transition-colors">Documentation</a>
                    <a href="https://docs.sui.io" target="_blank" rel="noopener noreferrer" className="block hover:text-cyan-400 transition-colors">Sui Docs</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white/70 mb-3">Built with</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/40">
                      <Image src="/Sui_crypto-logo-sui-png_4.png" alt="Sui" width={18} height={18} className="rounded-sm" />
                      <span>Sui</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <Image src="/Walrus_🦭_crypto-logo-wal-png_4.png" alt="Walrus" width={18} height={18} className="rounded-sm" />
                      <span>Walrus</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      <Image src="/tatum.svg" alt="Tatum" width={18} height={18} />
                      <span>Tatum</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
              <span>Built for the Sui ecosystem</span>
              <div className="flex items-center gap-4">
                <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <GithubIcon size={12} />
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MockFileCard({ icon, name, status }: { icon: React.ReactNode; name: string; status: string }) {
  const statusColors: Record<string, string> = {
    'verified': 'text-emerald-400 bg-emerald-400/10',
    'encrypted': 'text-blue-400 bg-blue-400/10',
    'on-chain': 'text-amber-400 bg-amber-400/10',
  };
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-3.5 flex items-center gap-3 cursor-default">
      <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-white/80 truncate block">{name}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${statusColors[status] || 'text-white/40 bg-white/5'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
