import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Eye, 
  Lock, 
  DollarSign, 
  Clock, 
  Sparkles 
} from "lucide-react";

interface EscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleName: string;
  dealValueUSD: number;
  onConfirmLock: () => void;
}

export function EscrowContractModal({ isOpen, onClose, titleName, dealValueUSD, onConfirmLock }: EscrowModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const platformFee = dealValueUSD * 0.10;
  const producerPayout = dealValueUSD * 0.90;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors">
          <X size={18} />
        </button>

        <div>
          <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">B2B Licensing Agreement</span>
          <h3 className="text-2xl font-black text-white mt-1">Lock Escrow Contract: {titleName}</h3>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Territory License:</span>
            <span className="font-bold text-white">North America SVOD (3 Years)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Gross Deal Value:</span>
            <span className="font-extrabold text-white text-lg font-mono">${dealValueUSD.toLocaleString()} USD</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Crayons Platform Fee (10%):</span>
            <span className="font-bold text-cyan-400 font-mono">${platformFee.toLocaleString()} USD</span>
          </div>
          <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-3">
            <span className="text-slate-300 font-bold">Net Producer Payout (90%):</span>
            <span className="font-extrabold text-emerald-400 text-xl font-mono">${producerPayout.toLocaleString()} USD</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-white">Terms & Conditions Summary:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Escrow funds locked securely in tier-1 bank account until master dispatch verification.</li>
            <li>Chain-of-title and censor board clearances validated by Admin OS.</li>
          </ul>
        </div>

        <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <span>I accept the B2B licensing terms and authorize digital escrow lock.</span>
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button 
            disabled={!agreed} 
            onClick={() => { onConfirmLock(); onClose(); }}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              agreed 
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Lock size={16} /> Sign & Lock Escrow Contract 🔒
          </button>
        </div>
      </div>
    </div>
  );
}

interface QCReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleName: string;
}

export function QCReportModal({ isOpen, onClose, titleName }: QCReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors">
          <X size={18} />
        </button>

        <div>
          <span className="text-xs font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={14} /> Technical QC Audit Log
          </span>
          <h3 className="text-2xl font-black text-white mt-1">QC Verification Report: {titleName}</h3>
        </div>

        <div className="space-y-3">
          {[
            { timecode: "00:14:22", type: "Audio Loudness", status: "FAILED", note: "Peak loudness exceeds -24 LKFS (-20.1 LKFS measured)." },
            { timecode: "00:42:15", type: "Video Aspect Ratio", status: "PASSED", note: "16:9 DCI 4K Scope compliant." },
            { timecode: "01:12:04", type: "Subtitle Sync Drift", status: "WARNING", note: "Malayalam SRT subtitles drift by +800ms." }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-cyan-400">{item.timecode}</span>
                <span className="font-bold text-white block mt-0.5">{item.type}</span>
                <span className="text-slate-400 block mt-0.5">{item.note}</span>
              </div>
              <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase border ${
                item.status === 'PASSED' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : item.status === 'FAILED'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer">
          Close Technical Report
        </button>
      </div>
    </div>
  );
}
