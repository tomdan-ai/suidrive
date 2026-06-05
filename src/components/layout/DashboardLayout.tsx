"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, Search, Menu, Upload, X, BookOpen, ExternalLink } from 'lucide-react';
import { AuthButton } from '@/components/AuthButton';

function GithubIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#02060f] text-white font-sans flex overflow-hidden relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,180,216,0.08)_0%,transparent_70%)] animate-watery-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,119,182,0.06)_0%,transparent_70%)] animate-watery-2" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#060b18]/90 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between lg:justify-start gap-3">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/suidrive.png" alt="SuiDrive" width={40} height={40} className="rounded-xl" />
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Upload Button */}
        <div className="px-4 py-3">
          <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="w-full btn-watery text-white py-3 px-4 rounded-xl flex items-center gap-3 font-semibold text-sm">
            <Upload size={18} />
            <span>New Upload</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<FileText size={18} />} label="My Files" href="/my-files" active={pathname === '/my-files'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<History size={18} />} label="Versions" href="/files" active={pathname?.startsWith('/files')} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        {/* Powered By + Open Source */}
        <div className="p-4 border-t border-white/5 mt-auto space-y-3">
          {/* Powered by Walrus & Sui */}
          <div className="flex items-center gap-2 opacity-60">
            <Image src="/Walrus_🦭_crypto-logo-wal-png_4.png" alt="Walrus" width={18} height={18} className="rounded-sm" />
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Powered by Walrus & Sui</span>
          </div>

          {/* Open Source Links */}
          <div className="flex items-center gap-3">
            <a href="https://github.com/tomdan-ai/suidrive" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-cyan-400 transition-colors">
              <GithubIcon size={13} />
              <span>GitHub</span>
              <ExternalLink size={9} />
            </a>
            <a href="https://github.com/tomdan-ai/suidrive/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-cyan-400 transition-colors">
              <BookOpen size={13} />
              <span>Docs</span>
              <ExternalLink size={9} />
            </a>
          </div>

          {/* Storage Bar */}
          <div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mb-1 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '45%' }} />
            </div>
            <p className="text-[10px] text-white/30">Walrus Testnet Storage</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 bg-[#02060f]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex items-center w-full max-w-2xl relative">
              <Search size={18} className="absolute left-4 text-white/30" />
              <input
                type="text"
                placeholder="Search in Drive"
                className="w-full bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/5 focus:border-cyan-500/40 rounded-full py-2.5 pl-12 pr-4 text-sm outline-none transition-all text-white placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <AuthButton />
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, href = "#", onClick }: any) {
  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}>
        <div className={active ? 'text-cyan-400' : 'text-white/40'}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}
