import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";

export function StakeholderHubSection() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<string>("creators");

  const personas = [
    {
      id: "creators",
      title: "Creators & Directors",
      badge: "IP Rights Vault & Anti-Piracy",
      roleParam: "creator",
      headline: "Protect your vision. Pitch directly to top global buyers.",
      subtext: "Upload vertical reels, scripts, or feature cuts. Every asset is cryptographically tagged with non-sublicensable legal protection.",
      metrics: [
        { label: "IP Protection", value: "100% Non-Sublicensable" },
        { label: "Direct Access", value: "7 Buyer Networks" },
        { label: "Revenue Split", value: "90% Net Producer Payout" }
      ],
      features: [
        "Drag & drop S3 presigned multipart upload",
        "Forensic watermark protection on all screeners",
        "Real-time buyer view analytics & stats"
      ],
      ctaText: "Launch Creator Vault"
    },
    {
      id: "studios",
      title: "Studios & Production",
      badge: "Slate Management & Camera RAW Vault",
      roleParam: "studio_producer",
      headline: "Manage multi-film slates with automated 10/90 & 50/50 splits.",
      subtext: "Store 4K/ProRes masters, censor board certificates, and chain-of-title contracts. Direct integration with Crayons Pictures Union.",
      metrics: [
        { label: "Storage Limit", value: "Up to 50 GB per Master" },
        { label: "Split Models", value: "10/90 Standard & 50/50 JV" },
        { label: "Censor Clearance", value: "Automated Admin OS" }
      ],
      features: [
        "Multi-film slate management dashboard",
        "Automated GST & platform fee calculator",
        "Direct bank escrow payout dispatches"
      ],
      ctaText: "Manage Studio Slate"
    },
    {
      id: "ott_buyers",
      title: "Global OTT Buyers",
      badge: "Rights-Cleared Catalog & Escrow Deal Room",
      roleParam: "global_buyer",
      headline: "Browse verified, rights-cleared cinema ready for global licensing.",
      subtext: "Screen watermarked 4K preview cuts with zero piracy risk. Submit Minimum Guarantee (MG) offers directly to producers.",
      metrics: [
        { label: "Buyer Networks", value: "Netflix, Prime, Hotstar" },
        { label: "Territory Avails", value: "North America, GCC, India" },
        { label: "Contract Security", value: "Locked Escrow Settlement" }
      ],
      features: [
        "Dynamic 5-second shifting forensic watermark player",
        "Territory holdback & exclusivity matrix",
        "Digital B2B escrow contract sign-off"
      ],
      ctaText: "Enter Buyer Marketplace"
    },
    {
      id: "tv_channels",
      title: "TV Channels & Networks",
      badge: "Satellite & Broadcast Windowing",
      roleParam: "global_buyer",
      headline: "Acquire exclusive linear TV & satellite broadcast rights.",
      subtext: "Acquire Satellite, Cable, and FAST Channel rights with strict holdbacks from digital OTT release windows.",
      metrics: [
        { label: "Rights Types", value: "Satellite, FAST, Cable" },
        { label: "Language Stems", value: "Malayalam, Tamil, Hindi" },
        { label: "Window Holds", value: "Custom Holdback Schedules" }
      ],
      features: [
        "Satellite rights availability filters",
        "Audio dubbing stem verification",
        "Censor certificate compliance reports"
      ],
      ctaText: "Browse Broadcast Rights"
    },
    {
      id: "investors",
      title: "Investors & Co-Producers",
      badge: "Transparent Yield & Waterfall Ledger",
      roleParam: "investor",
      headline: "Real-time financial transparency for film equity and ROI.",
      subtext: "Track gross box office & digital licensing receipts, platform fee deductions (10%/50%), 18% GST, and net disbursements.",
      metrics: [
        { label: "Transparency", value: "100% Audited Ledger" },
        { label: "Disbursement", value: "Instant Escrow Settlement" },
        { label: "ROI Tracking", value: "Real-time Deal Analytics" }
      ],
      features: [
        "Real-time waterfall disbursement tracker",
        "Audited transaction history export",
        "Portfolio yield & MG analytics"
      ],
      ctaText: "View Investor Audit Ledgers"
    },
    {
      id: "ancillary",
      title: "Ancillary Services",
      badge: "Audio Stem & Promo Boost Engine",
      roleParam: "creator",
      headline: "Dubbing, subtitling, score stems, and promo marketing.",
      subtext: "Register audio dubbing stems (WAV), subtitle tracks (SRT), score stems, and purchase Matchmaker Promo Boost packages.",
      metrics: [
        { label: "Audio Stems", value: "5.1 Surround & Stereo WAV" },
        { label: "Subtitles", value: "Multi-language SRT" },
        { label: "Promo Engine", value: "Matchmaker Targeted" }
      ],
      features: [
        "Audio dubbing stem ingestion vault",
        "Subtitle synchronization pre-check",
        "Matchmaker promo boost store"
      ],
      ctaText: "Explore Ancillary Hub"
    }
  ];

  const current = personas.find(p => p.id === activePersona) || personas[0];

  return (
    <section className="py-20 bg-[#090D16] border-t border-slate-800/80 font-sans">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
            Ecosystem Architecture
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white">
            Tailored B2B Workspace Portals
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium">
            A unified cinema marketplace customized for all key distribution personas.
          </p>
        </div>

        {/* Persona Tabs (Clean Slate Palette) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePersona === p.id
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-md"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Active Persona Feature Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 lg:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-5">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              {current.badge}
            </span>

            <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              {current.headline}
            </h3>

            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {current.subtext}
            </p>

            <div className="space-y-2.5 pt-1">
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => navigate(`/workspace?role=${current.roleParam}`)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>{current.ctaText}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Persona Value Metrics
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {current.metrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{m.label}</span>
                    <span className="text-xs font-extrabold text-white block">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 font-medium flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-amber-400 shrink-0" />
              <span>StreamVista OPC Pvt Ltd Non-Sublicensable Governance Active.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
