"use client";
import React from 'react';

export default function SuiDriveMasterpiece() {
  return (
    <div className="min-h-screen bg-[#020A14] text-white font-sans selection:bg-[#00F0FF] selection:text-[#020A14] overflow-x-hidden relative">
     
      {/* 1. LAYER: CINEMATIC BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-center radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0052CC]/20 via-transparent to-transparent"></div>
        {/* Neon laser strings / data lines */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* 2. LAYER: FIXED HEADER NAVIGATION */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00F0FF] to-[#0052CC] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] rotate-3">
            <span className="text-[#020A14] font-black text-2xl">S</span>
          </div>
          <span className="text-3xl font-black tracking-tighter">SuiDrive</span>
        </div>
       
        <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-[3px] font-bold text-slate-400">
          <a href="#" className="text-[#00F0FF] border-b border-[#00F0FF] pb-1">Home</a>
          <a href="#" className="hover:text-white transition-colors">Storage</a>
          <a href="#" className="hover:text-white transition-colors">Developers</a>
          <a href="#" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>

        <button className="px-8 py-3 bg-gradient-to-r from-[#00F0FF] to-[#0080FF] text-[#020A14] rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2">
          Launch App <span className="text-lg">→</span>
        </button>
      </nav>

      {/* 3. LAYER: MAIN HERO WORKSPACE */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-10 pt-10">
       
        <div className="flex flex-col lg:flex-row items-start gap-20">
         
          {/* Left Content */}
          <div className="flex-1 space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#00F0FF]/5 border border-[#00F0FF]/20 text-[#00F0FF] text-[10px] tracking-[3px] font-bold uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
              </span>
              Built on Sui. Secured by Walrus.
            </div>
           
            <h1 className="text-[110px] font-black leading-[0.8] tracking-tighter uppercase italic">
              IMMUTABLE,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00F0FF] to-[#0052CC] drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">PERMANENT.</span><br />
              YOURS.
            </h1>
           
            <p className="text-slate-400 text-xl max-w-lg font-light leading-relaxed italic border-l-2 border-[#0052CC] pl-6">
              SuiDrive is the decentralized storage layer for the permanent web. Store anything. Forever.
            </p>

            {/* Terminal Interface */}
            <div className="w-full max-w-xl group">
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-[#00F0FF]/40 via-transparent to-[#0052CC]/40 overflow-hidden">
                <div className="bg-[#0A1128]/90 backdrop-blur-3xl rounded-2xl p-8 border border-white/5 relative z-10">
                  <div className="flex justify-between items-center mb-8 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                    <span>&gt;_ suidrive / session-init</span>
                    <span className="text-[#00F0FF] flex items-center gap-2">
                      zkLogin Ready <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
                    </span>
                  </div>
                 
                  <div className="space-y-4 mb-10 font-mono">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>✓ Wallet Detected</span>
                      <span className="text-white">0x7fA3...9c7B</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>✓ Network</span>
                      <span className="text-cyan-400 font-bold">SUI MAINNET</span>
                    </div>
                  </div>

                  <button className="w-full py-5 bg-gradient-to-r from-[#0080FF] to-[#00F0FF] rounded-xl font-black text-[#020A14] uppercase tracking-widest hover:shadow-[0_0_50px_rgba(0,240,255,0.3)] transition-all flex items-center justify-between px-8">
                    <span>Initialize zkLogin</span>
                    <span className="text-2xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual: Holographic Glass Cubes */}
          <div className="flex-1 relative h-[600px] w-full hidden lg:block">
            {/* Main Cube v2.4.1 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 glass-cube flex flex-col items-center justify-center animate-float">
                <div className="text-[10px] tracking-[5px] text-[#00F0FF] mb-4">OBJECT</div>
                <div className="text-5xl font-black text-white/90">v2.4.1</div>
                <div className="absolute inset-4 border border-[#00F0FF]/10 rounded-2xl"></div>
            </div>
            {/* Sub Cube v2.3.9 */}
            <div className="absolute top-[60%] right-[10%] w-48 h-48 glass-cube-dim flex flex-col items-center justify-center animate-float-delayed">
                <div className="text-[8px] tracking-[4px] text-white/40 mb-2">BLOB</div>
                <div className="text-2xl font-black text-white/30">v2.3.9</div>
            </div>
          </div>
        </div>

        {/* 4. LAYER: NETWORK METRICS BAR */}
        <div className="mt-20 py-10 border-y border-white/5 flex flex-wrap justify-between gap-10">
          <Metric label="Network Status" value="Online" color="text-green-400" />
          <Metric label="Uptime" value="99.99%" color="text-white" />
          <Metric label="Total Stored" value="2.47 PiB" color="text-[#00F0FF]" />
          <Metric label="Latency" value="12ms" color="text-white" />
        </div>

        {/* 5. LAYER: BENTO FEATURE GRID */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <BentoItem title="Powered by Walrus" wide color="cyan" />
          <BentoItem title="Permanent Ownership" />
          <MetricCard value="2.47 PiB" label="Storage" />
          <BentoItem title="Developer Tools" wide color="blue" />
          <BentoItem title="AI Analysis" />
        </div>
      </main>

      <footer className="mt-20 pb-10 px-10 text-[10px] tracking-widest text-slate-600 uppercase flex justify-between items-center max-w-[1600px] mx-auto border-t border-white/5 pt-10">
        <span>© 2026 SuiDrive. All Rights Reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-[#00F0FF]">Twitter</a>
          <a href="#" className="hover:text-[#00F0FF]">Discord</a>
          <a href="#" className="hover:text-[#00F0FF]">GitHub</a>
        </div>
      </footer>

      {/* CUSTOM CSS FOR THE masterpiece FEEL */}
      <style jsx>{`
        .glass-cube {
          background: rgba(0, 240, 255, 0.03);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(0, 240, 255, 0.3);
          box-shadow: 0 0 80px rgba(0, 240, 255, 0.1), inset 0 0 40px rgba(0, 240, 255, 0.1);
          border-radius: 40px;
          transform: perspective(1000px) rotateX(20deg) rotateY(-20deg);
        }
        .glass-cube-dim {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          transform: perspective(1000px) rotateX(-15deg) rotateY(15deg);
        }
        @keyframes float {
          0%, 100% { transform: perspective(1000px) rotateX(20deg) rotateY(-20deg) translateY(0); }
          50% { transform: perspective(1000px) rotateX(20deg) rotateY(-20deg) translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float-delayed {
          0%, 100% { transform: perspective(1000px) rotateX(-15deg) rotateY(15deg) translateY(0); }
          50% { transform: perspective(1000px) rotateX(-15deg) rotateY(15deg) translateY(-30px); }
        }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function Metric({ label, value, color }: any) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] tracking-[3px] text-slate-500 uppercase font-bold">{label}</span>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
  );
}

function BentoItem({ title, wide, color }: any) {
  const borderColor = color === 'cyan' ? 'hover:border-[#00F0FF]' : 'hover:border-[#0052CC]';
  return (
    <div className={`${wide ? 'md:col-span-2' : 'col-span-1'} p-10 rounded-[32px] bg-white/[0.02] border border-white/5 transition-all duration-500 group cursor-pointer ${borderColor} hover:-translate-y-2`}>
      <h3 className="text-xl font-black group-hover:text-white transition-colors">{title}</h3>
      <p className="mt-4 text-sm text-slate-500 font-light leading-relaxed">Immutable file infrastructure verified on the Sui blockchain via Tatum RPC.</p>
    </div>
  );
}

function MetricCard({ value, label }: any) {
  return (
    <div className="p-8 rounded-[32px] bg-[#00F0FF]/5 border border-[#00F0FF]/20 flex flex-col items-center justify-center text-center">
      <div className="text-3xl font-black text-[#00F0FF]">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-[#00F0FF] mt-2 opacity-60">{label}</div>
    </div>
  );
}