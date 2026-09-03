import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Database, Server, Terminal, CheckCircle2 } from 'lucide-react';

interface QCLog {
  time: string;
  type: 'INFO' | 'CHECK' | 'SUCCESS' | 'ERROR';
  message: string;
}

export default function NOCDashboard() {
  const [logs] = useState<QCLog[]>([
    { time: '23:27:01', type: 'INFO', message: 'Triggering Automated 10-Point QC Scan on Asset ID: #MV-2026-04' },
    { time: '23:27:03', type: 'CHECK', message: 'Video Bitrate Check: 45 Mbps [STABLE]' },
    { time: '23:27:05', type: 'CHECK', message: 'Frame Drop Audit: 0 Dropped Frames [PASSED]' },
    { time: '23:27:06', type: 'INFO', message: 'Injecting Distribution Constraint: "No Right to Deliver to Next Person"' },
    { time: '23:27:08', type: 'SUCCESS', message: 'Asset Verified. Ready for Crayons Bridge Sync.' },
  ]);

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-400 font-mono p-8 selection:bg-cyan-500/30">
      {/* NOC Header */}
      <div className="flex justify-between items-center border-b border-cyan-900/50 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
            <Activity className="animate-pulse text-red-500" />
            STREAMVISTA NOC <span className="text-zinc-500 text-sm font-normal">| ASIA-SOUTH1-MUMBAI</span>
          </h1>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">CrayonsLoop Real-Time Surveillance Engine</p>
        </div>
        <div className="flex gap-6 text-[10px] text-right">
          <div>
            <p className="text-zinc-500 uppercase">System Status</p>
            <p className="text-emerald-500">OPERATIONAL</p>
          </div>
          <div>
            <p className="text-zinc-500 uppercase">Oracle ADB</p>
            <p className="text-cyan-500">CONNECTED</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Metrics */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <MetricCard icon={<Cpu />} label="Ingestion Load" value="24.8%" trend="+2.1%" />
          <MetricCard icon={<Database />} label="ADB Latency" value="12ms" trend="STABLE" />
          <MetricCard icon={<Server />} label="Active Streams" value="142" trend="HIGH" />
          
          <div className="bg-zinc-900/40 border border-cyan-900/30 rounded p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
              Legal Compliance Guard
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-500">Rights Cleared</span>
                <span className="text-emerald-500">98.2%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-zinc-500">Distribution Lock</span>
                <span className="text-cyan-500">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QC Feed */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-black/60 border border-cyan-900/50 rounded-lg overflow-hidden flex flex-col h-[600px] shadow-[0_0_50px_rgba(6,182,212,0.05)]">
            <div className="bg-cyan-900/20 px-4 py-2 border-b border-cyan-900/50 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                Live QC Feed (CrayonsLoop Standard)
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar text-[12px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 group hover:bg-cyan-500/5 p-1 rounded transition-colors">
                  <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                  <span className={`font-bold shrink-0 w-16 ${
                    log.type === 'SUCCESS' ? 'text-emerald-500' : 
                    log.type === 'CHECK' ? 'text-cyan-500' : 
                    log.type === 'ERROR' ? 'text-red-500' : 'text-zinc-400'
                  }`}>{log.type}</span>
                  <span className="text-zinc-300"> - {log.message}</span>
                  {log.type === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-500 inline ml-auto" />}
                </div>
              ))}
              <div className="animate-pulse inline-block w-2 h-4 bg-cyan-500/50 ml-20 mt-2"></div>
            </div>
            
            <div className="bg-black p-4 border-t border-cyan-900/30 flex items-center gap-4">
              <span className="text-zinc-600">$</span>
              <input 
                type="text" 
                placeholder="Awaiting asset trigger..." 
                className="bg-transparent border-none outline-none text-cyan-400 w-full placeholder:text-zinc-800"
                readOnly
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-zinc-900/40 border border-cyan-900/30 rounded p-6 backdrop-blur-md group hover:border-cyan-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded bg-cyan-950/50 text-cyan-500 group-hover:text-cyan-400 transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-500 font-bold">{trend}</span>
      </div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tighter">{value}</p>
    </div>
  );
}
