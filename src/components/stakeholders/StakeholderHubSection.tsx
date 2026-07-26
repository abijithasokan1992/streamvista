import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Film, 
  Briefcase, 
  Globe, 
  Tv, 
  DollarSign, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Lock,
  Play
} from "lucide-react";

export function StakeholderHubSection() {
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<string>("creators");

  const personas = [
    {
      id: "creators",
      icon: "🎬",
      title: "Creators & Directors",
      badge: "IP Rights Vault & Anti-Piracy Shield",
      roleParam: "creator",
      headline: "Protect your vision. Pitch directly to top global buyers.",
      subtext: "Upload vertical reels, scripts, or feature cuts. Every asset is cryptographically tagged with non-sublicensable legal protection.",
      metrics: [
        { label: "IP Protection", value: "100% Non-Sublicensable" },
        { label: "Direct Access", value: "7 Global Buyer Networks" },
        { label: "Revenue Split", value: "90% Net Producer Payout" }
      ],
      features: [
        "Drag & drop S3 presigned multipart upload",
        "Forensic watermark protection on all screeners",
        "Real-time buyer view analytics & stats"
      ],
      ctaText: "Launch Creator Ingestion Hub 🚀"
    },
    {
      id: "studios",
      icon: "🏢",
      title: "Studios & Production Houses",
      badge: "Slate Management & RAW Camera Vault",
      roleParam: "studio_producer",
      headline: "Manage multi-film slates with automated 10/90 & 50/50 splits.",
      subtext: "Store 4K/ProRes masters, censor board certificates, and chain-of-title contracts. Direct integration with Crayons Pictures Union.",
      metrics: [
        { label: "Storage Limit", value: "Up to 50 GB per Master" },
        { label: "Split Models", value: "10/90 Standard & 50/50 JV" },
        { label: "Censor Clearance", value: "Automated Admin OS Verification" }
      ],
      features: [
        "Multi-film slate management dashboard",
        "Automated GST & platform fee calculator",
        "Direct bank escrow payout dispatches"
      ],
      ctaText: "Manage Studio Slate Vault 🏢"
    },
    {
      id: "ott_buyers",
      icon: "🌐",
      title: "Global OTT Buyers",
      badge: "Rights-Cleared Catalog & Escrow Deal Room",
      roleParam: "global_buyer",
      headline: "Browse verified, rights-cleared cinema ready for global licensing.",
      subtext: "Screen watermarked 4K preview cuts with zero piracy risk. Submit Minimum Guarantee (MG) offers directly to producers.",
      metrics: [
        { label: "Buyer Networks", value: "Netflix, Prime, Hotstar, Sony" },
        { label: "Territory Avails", value: "North America, GCC, India, WW" },
        { label: "Contract Security", value: "Locked Escrow Settlement" }
      ],
      features: [
        "Dynamic 5-second shifting forensic watermark player",
        "Territory holdback & exclusivity matrix",
        "Digital B2B escrow contract sign-off"
      ],
      ctaText: "Enter B2B Buyer Marketplace 🌐"
    },
    {
      id: "tv_channels",
      icon: "📺",
      title: "TV Channels & Networks",
      badge: "Satellite & Linear Windowing Portal",
      roleParam: "global_buyer",
      headline: "Acquire exclusive linear TV & satellite broadcast rights.",
      subtext: "Acquire Satellite, Cable, and FAST Channel rights with strict holdbacks from digital OTT release windows.",
      metrics: [
        { label: "Rights Types", value: "Satellite, FAST, Cable, Linear" },
        { label: "Language Stems", value: "Malayalam, Tamil, Hindi, Turkish" },
        { label: "Window Holds", value: "Custom Holdback Schedules" }
      ],
      features: [
        "Satellite rights availability filters",
        "Audio dubbing stem verification",
        "Censor certificate compliance reports"
      ],
      ctaText: "Browse Broadcast Satellite Rights 📺"
    },
    {
      id: "investors",
      icon: "💼",
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
      ctaText: "View Investor Audit Ledgers 💼"
    },
    {
      id: "ancillary",
      icon: "🛠️",
      title: "Ancillary & Service Providers",
      badge: "Stem Audio Exchange & Promo Boost Engine",
      roleParam: "creator",
      headline: "Dubbing, subtitling, score stems, and promo boost marketing.",
      subtext: "Register audio dubbing stems (WAV), subtitle tracks (SRT), score stems, and purchase Matchmaker Promo Boost packages.",
      metrics: [
        { label: "Audio Stems", value: "5.1 Surround & Stereo WAV" },
        { label: "Subtitles", value: "Multi-language SRT Verification" },
        { label: "Promo Engine", value: "Matchmaker Targeted Placement" }
      ],
      features: [
        "Audio dubbing stem ingestion vault",
        "Subtitle synchronization pre-check",
        "Matchmaker promo boost store"
      ],
      ctaText: "Explore Ancillary Services Hub 🛠️"
    }
  ];

  const current = personas.find(p => p.id === activePersona) || personas[0];

  return (
    <section className="py-24 bg-slate-950 border-t border-slate-800 font-sans relative overflow-hidden">
      {/* Subtle Glow Backgrounds */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Ecosystem Architecture • Built For All 6 Personas
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-white">
            Designed to Feel Exactly Like <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Your Home</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-3xl mx-auto font-medium leading-relaxed">
            Whether you are a Creator protecting your IP, a Studio managing 4K slates, an OTT Buyer screening watermarked films, or an Investor tracking ROI — StreamVista Cloud X provides a specialized, persona-tailored B2B environment.
          </p>
        </div>

        {/* 6 Stakeholder Tab Switchers */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer ${
                activePersona === p.id
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105"
                  : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        {/* Active Stakeholder Persona Feature Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Headline, Subtext, Features */}
          <div className="space-y-6">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-cyan-400 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              {current.badge}
            </span>

            <h3 className="text-2xl lg:text-4xl font-black text-white leading-tight">
              {current.headline}
            </h3>

            <p className="text-sm lg:text-base text-slate-300 font-medium leading-relaxed">
              {current.subtext}
            </p>

            <div className="space-y-3 pt-2">
              {current.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs lg:text-sm text-slate-200 font-bold">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate(`/workspace?role=${current.roleParam}`)}
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs lg:text-sm px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
              >
                {current.ctaText}
              </button>
            </div>
          </div>

          {/* Right Column: 3 Metric Key Value Badges */}
          <div className="space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block">
                Target Persona Value Metrics
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {current.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">{m.label}</span>
                    <span className="text-sm font-black text-white block">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
              <span>Governed by StreamVista OPC Pvt Ltd Non-Sublicensable Legal Mandate.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
