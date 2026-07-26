import React, { useState } from "react";
import { 
  ShieldCheck, 
  Tv, 
  FileText, 
  Download, 
  Globe, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  Save 
} from "lucide-react";

export interface BuyerPermission {
  buyerId: number;
  buyerName: string;
  buyerEmail: string;
  filmTitle: string;
  allowScreenerStream: boolean;
  allowFilmInfoDownload: boolean;
  allowTrailerDownload: boolean;
  licensedTerritories: string[];
  validityPeriod: string;
  nonSublicensableFlag: boolean;
}

interface BuyerPermissionMatrixProps {
  initialPermission?: BuyerPermission;
  onSave?: (updatedPermission: BuyerPermission) => void;
}

const TERRITORY_OPTIONS = [
  "India",
  "GCC / Middle East",
  "North America SVOD",
  "Europe",
  "Asia-Pacific",
  "Worldwide"
];

const VALIDITY_OPTIONS = [
  { id: "1_Year", label: "1 Year Standard License" },
  { id: "3_Years", label: "3 Years Extended License" },
  { id: "5_Years", label: "5 Years Long-Term License" },
  { id: "Perpetual", label: "Perpetual Rights" }
];

export function BuyerPermissionMatrix({ initialPermission, onSave }: BuyerPermissionMatrixProps) {
  const [permission, setPermission] = useState<BuyerPermission>(initialPermission || {
    buyerId: 53,
    buyerName: "Amazon Prime Video Licensing",
    buyerEmail: "buyer.licensing@amazon.com",
    filmTitle: "Jananam 1947 Pranayam Thudarunnu",
    allowScreenerStream: true,
    allowFilmInfoDownload: true,
    allowTrailerDownload: true,
    licensedTerritories: ["India", "North America SVOD"],
    validityPeriod: "3_Years",
    nonSublicensableFlag: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleTerritory = (territory: string) => {
    setPermission(prev => {
      const exists = prev.licensedTerritories.includes(territory);
      const updated = exists 
        ? prev.licensedTerritories.filter(t => t !== territory)
        : [...prev.licensedTerritories, territory];
      return { ...prev, licensedTerritories: updated };
    });
  };

  const handleSave = () => {
    if (onSave) onSave(permission);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 max-w-4xl w-full mx-auto font-sans">
      {/* 1. Mandate Header & Mandatory Legal Warning */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">Matchmaker OS</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">B2B Buyer Permission Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">Configure asset accessibility and territorial rights for partner buyer accounts.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          <Save size={16} /> Save Permission State
        </button>
      </div>

      {/* Mandatory Non-Sublicensable Mandate Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-300 text-xs">
        <AlertOctagon size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wide block">Mandatory Legal Mandate Active:</span>
          <span className="text-amber-200/90 font-medium">
            All licensing rights managed through StreamVista Cloud X are strictly <strong>NON-SUBLICENSABLE and NON-TRANSFERABLE</strong> ("No Right to Deliver to Next Person"). Sub-licensing or secondary transfer without prior explicit authorization is prohibited by law.
          </span>
        </div>
      </div>

      {/* 2. Target Buyer & Film Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Buyer Account</span>
          <span className="text-base font-extrabold text-white block mt-0.5">{permission.buyerName}</span>
          <span className="text-xs text-cyan-400 font-mono block mt-0.5">{permission.buyerEmail}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Film Title</span>
          <span className="text-base font-extrabold text-white block mt-0.5">{permission.filmTitle}</span>
          <span className="text-xs text-slate-400 font-mono block mt-0.5">Asset ID: #7 • 4K Scope Master</span>
        </div>
      </div>

      {/* 3. Asset Access Toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider">Asset Feature & Stream Permissions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toggle 1: Screener Stream */}
          <div className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            permission.allowScreenerStream 
              ? 'bg-slate-950 border-cyan-500/40 shadow-md' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`} onClick={() => setPermission(p => ({ ...p, allowScreenerStream: !p.allowScreenerStream }))}>
            <div className="flex items-center justify-between mb-2">
              <Tv className={permission.allowScreenerStream ? "text-cyan-400" : "text-slate-500"} size={22} />
              <input type="checkbox" checked={permission.allowScreenerStream} onChange={() => {}} className="w-4 h-4 rounded text-cyan-500" />
            </div>
            <span className="font-extrabold text-white text-sm block">Screener Stream</span>
            <span className="text-[11px] text-slate-400 block mt-1">Watermarked forensic player access.</span>
          </div>

          {/* Toggle 2: Film Info Download */}
          <div className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            permission.allowFilmInfoDownload 
              ? 'bg-slate-950 border-cyan-500/40 shadow-md' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`} onClick={() => setPermission(p => ({ ...p, allowFilmInfoDownload: !p.allowFilmInfoDownload }))}>
            <div className="flex items-center justify-between mb-2">
              <FileText className={permission.allowFilmInfoDownload ? "text-cyan-400" : "text-slate-500"} size={22} />
              <input type="checkbox" checked={permission.allowFilmInfoDownload} onChange={() => {}} className="w-4 h-4 rounded text-cyan-500" />
            </div>
            <span className="font-extrabold text-white text-sm block">Press Kit Download</span>
            <span className="text-[11px] text-slate-400 block mt-1">Metadata, posters, screenplay PDFs.</span>
          </div>

          {/* Toggle 3: Trailer Download */}
          <div className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            permission.allowTrailerDownload 
              ? 'bg-slate-950 border-cyan-500/40 shadow-md' 
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`} onClick={() => setPermission(p => ({ ...p, allowTrailerDownload: !p.allowTrailerDownload }))}>
            <div className="flex items-center justify-between mb-2">
              <Download className={permission.allowTrailerDownload ? "text-cyan-400" : "text-slate-500"} size={22} />
              <input type="checkbox" checked={permission.allowTrailerDownload} onChange={() => {}} className="w-4 h-4 rounded text-cyan-500" />
            </div>
            <span className="font-extrabold text-white text-sm block">Trailer Download</span>
            <span className="text-[11px] text-slate-400 block mt-1">High-bitrate promo video downloads.</span>
          </div>
        </div>
      </div>

      {/* 4. Territory Selection & Validity Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Licensed Territories */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" /> Licensed Territories
          </label>
          <div className="flex flex-wrap gap-2">
            {TERRITORY_OPTIONS.map((t) => {
              const selected = permission.licensedTerritories.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTerritory(t)}
                  className={`text-xs font-extrabold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {selected ? "✓ " : "+ "}{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* License Validity Period */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" /> License Validity Period
          </label>
          <select
            value={permission.validityPeriod}
            onChange={(e) => setPermission(p => ({ ...p, validityPeriod: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 text-sm font-bold text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
          >
            {VALIDITY_OPTIONS.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-black animate-fade-in">
          <CheckCircle2 size={18} /> Permission Matrix Updated Successfully & Saved to Database!
        </div>
      )}
    </div>
  );
}
