"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, Activity, Search, Menu, Upload, HardDrive, Zap, X } from 'lucide-react';
import { AuthButton } from '@/components/AuthButton';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between lg:justify-start gap-2">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-medium text-slate-800">SuiDrive</span>
          </Link>
          <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4">
          <Link href="/upload" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl flex items-center gap-3 font-medium transition-colors shadow-sm">
            <Upload size={18} className="text-blue-600" />
            <span>New Upload</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<FileText size={18} />} label="My Files" href="/my-files" active={pathname === '/my-files'} onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<History size={18} />} label="Versions" href="/files" active={pathname?.startsWith('/files')} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50 mt-auto">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <HardDrive size={14} />
            <span className="text-xs font-medium">Storage</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mb-1">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-slate-500">2.4 GB of 15 GB used</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center w-full max-w-2xl relative">
              <Search size={18} className="absolute left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search in Drive"
                className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white border border-transparent focus:border-blue-600 rounded-full py-2.5 pl-12 pr-4 text-sm outline-none transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 ml-4">
             <AuthButton />
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-auto bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, href = "#", onClick }: any) {
  return (
    <Link href={href} onClick={onClick}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-full transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
        <div className={active ? 'text-blue-700' : 'text-slate-500'}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}
