import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, DollarSign, Eye, Sparkles, Radio } from "lucide-react";

export function LiveActivityTickerBar() {
  const [activeBuyerCount, setActiveBuyerCount] = useState(14);
  const [streamCount, setStreamCount] = useState(3);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    "🟢 LIVE: Amazon Prime Video locked $35,000 USD Escrow for 'Jananam 1947' (2 mins ago)",
    "⚡ LIVE: Netflix Asia-Pacific viewed 4K Screener for 'Imran 3:185' (5 mins ago)",
    "🛡️ LIVE: Admin OS approved Chain-of-Title Legal Certificate for 'Civilian'",
    "💳 LIVE: Escrow Payout $31,500 USD Dispatched to Abijith Asokan (Crayons Pictures)",
    "🌐 LIVE: Sony LIV requested Territory Avails for North America SVOD"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
      setActiveBuyerCount(12 + Math.floor(Math.random() * 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 border-b border-cyan-500/30 text-xs font-mono text-slate-200 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md relative overflow-hidden z-40">
      {/* Background Subtle Pulse Glow */}
      <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />

      {/* Left Live Indicator & Ticker Message */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider shrink-0">
          <Radio size={12} className="animate-pulse text-emerald-400" /> LIVE B2B TICKER
        </span>
        
        <p className="text-cyan-300 font-bold truncate transition-all duration-500">
          {tickerMessages[tickerIndex]}
        </p>
      </div>

      {/* Right Real-time Counter Stats */}
      <div className="flex items-center gap-4 text-[11px] font-extrabold shrink-0 text-slate-300">
        <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-white">{activeBuyerCount} Buyers Online</span>
        </span>

        <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 hidden sm:flex">
          <Eye size={12} className="text-cyan-400" />
          <span className="text-cyan-300">{streamCount} Active Screeners</span>
        </span>
      </div>
    </div>
  );
}
