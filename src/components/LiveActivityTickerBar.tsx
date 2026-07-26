import React, { useState, useEffect } from "react";
import { Radio, Eye, ShieldCheck } from "lucide-react";

export function LiveActivityTickerBar() {
  const [activeBuyerCount, setActiveBuyerCount] = useState(14);
  const [streamCount, setStreamCount] = useState(3);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerMessages = [
    "Amazon Prime Video locked $35,000 USD Escrow for 'Jananam 1947' (2 mins ago)",
    "Netflix Asia-Pacific viewed 4K Screener for 'Imran 3:185' (5 mins ago)",
    "Admin OS approved Chain-of-Title Legal Certificate for 'Civilian'",
    "Escrow Payout $31,500 USD Dispatched to Abijith Asokan (Crayons Pictures)",
    "Sony LIV requested Territory Avails for North America SVOD"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
      setActiveBuyerCount(12 + Math.floor(Math.random() * 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#090D16] border-b border-slate-800 text-xs font-sans text-slate-300 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm relative z-40">
      {/* Left Live Indicator & Ticker Message */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-widest uppercase shrink-0">
          <Radio size={11} className="animate-pulse text-amber-400" /> LIVE B2B TICKER
        </span>
        
        <p className="text-slate-200 font-semibold truncate transition-all duration-500">
          {tickerMessages[tickerIndex]}
        </p>
      </div>

      {/* Right Real-time Counter Stats */}
      <div className="flex items-center gap-4 text-[11px] font-bold shrink-0 text-slate-400">
        <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-200">{activeBuyerCount} Buyers Online</span>
        </span>

        <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 hidden sm:flex">
          <Eye size={12} className="text-slate-400" />
          <span className="text-slate-200">{streamCount} Active Screeners</span>
        </span>
      </div>
    </div>
  );
}
