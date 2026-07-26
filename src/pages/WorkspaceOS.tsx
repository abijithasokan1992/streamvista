import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NotificationBell } from "../components/NotificationBell";
import { 
  Film, 
  ShieldCheck, 
  DollarSign, 
  Tv, 
  Briefcase, 
  BarChart3, 
  CheckCircle2, 
  Play, 
  Plus, 
  FileText, 
  Search,
  LogOut,
  ArrowLeft
} from "lucide-react";

export function WorkspaceOS() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Current active workspace: creator | studio_producer | global_buyer | investor | consumer | admin_os
  const currentRole = searchParams.get("role") || "creator";

  // Current Admin OS sub-role tab: legal | qc | matchmaker | finance
  const [adminTab, setAdminTab] = useState<"legal" | "qc" | "matchmaker" | "finance">("legal");

  // 4-Step Pipeline active step
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(1);

  // Switch Workspace handler
  const handleWorkspaceChange = (role: string) => {
    setSearchParams({ role });
  };

  const workspaces = [
    { id: "creator", name: "🎬 Creator Workspace", icon: Film },
    { id: "studio_producer", name: "🏢 Studio / Producer", icon: Briefcase },
    { id: "global_buyer", name: "🌐 Global Buyer", icon: Search },
    { id: "investor", name: "💼 Investor Workspace", icon: DollarSign },
    { id: "consumer", name: "📺 Consumer (Crayons Loop)", icon: Tv },
    { id: "admin_os", name: "🛡️ Admin OS", icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. OS Top Bar */}
      <header className="h-20 bg-slate-900 border-b border-slate-800 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-cyan-500/20">
              SV
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg tracking-tight group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                StreamVista <span className="text-[11px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Crayons Bridge Workspace</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Workspace Switcher Selector */}
          <div className="relative">
            <select 
              value={currentRole}
              onChange={(e) => handleWorkspaceChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 hover:border-cyan-400 text-white text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer transition-all shadow-sm"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Tools: Notifications & Profile */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          <div className="h-6 w-px bg-slate-800" />

          <button 
            onClick={() => navigate("/")}
            className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Landing Page
          </button>
        </div>
      </header>

      {/* 2. 4-Step Pipeline Progress Banner */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold">
          <span className="text-cyan-400 uppercase tracking-widest text-xs">
            4-Step B2B Pipeline:
          </span>

          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
            {[
              { num: 1, label: "Upload Assets" },
              { num: 2, label: "Legal & QC Verify" },
              { num: 3, label: "Deal Room & Escrow" },
              { num: 4, label: "Dispatch & Payout" }
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setPipelineStep(step.num as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  pipelineStep === step.num
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-extrabold shadow-sm"
                    : pipelineStep > step.num
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  pipelineStep === step.num
                    ? "bg-cyan-500 text-slate-950"
                    : pipelineStep > step.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {pipelineStep > step.num ? <CheckCircle2 size={14} /> : step.num}
                </span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Workspace Stage Canvas */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl w-full mx-auto space-y-8">
        
        {/* WORKSPACE VIEW 1: CREATOR */}
        {currentRole === "creator" && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                  🎬 Creator Workspace
                </h1>
                <p className="text-base text-slate-300 mt-2">
                  Upload vertical clips, feature films, scripts & music. Set rights terms and trigger promo boosts.
                </p>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer">
                <Plus size={18} /> New Asset Submission
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4 shadow-md hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Film size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Vertical & Short Videos</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Ingest vertical clips, trailers, and promo reels for instant buyer preview.</p>
                <button className="w-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-all cursor-pointer">
                  Upload Video Clip
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4 shadow-md hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Scripts & Music Specs</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Register screenplays, audio dubbing stems, and background score tracks.</p>
                <button className="w-full text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl transition-all cursor-pointer">
                  Upload Script / Audio
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4 shadow-md hover:border-slate-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Promo Boost Store</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Promote your catalogue directly on Global Buyer screening dashboards.</p>
                <button className="w-full text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 py-3 rounded-xl transition-all cursor-pointer">
                  Buy Promo Boost
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 2: STUDIO / PRODUCER */}
        {currentRole === "studio_producer" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                🏢 Studio / Producer Workspace
              </h1>
              <p className="text-base text-slate-300 mt-2">
                Manage full film slates, camera RAW vaults, censor certificates & studio payout accounts.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-white mb-6">Active Production Slate</h3>
              <div className="divide-y divide-slate-800">
                {[
                  { title: "Imran 3:185", status: "QC Approved", rights: "Worldwide OTT", revenue: "$24,500" },
                  { title: "Jananam 1947 Pranayam Thudarunnu", status: "Deal Room Active", rights: "SVOD / Satellite", revenue: "$48,200" }
                ].map((item, idx) => (
                  <div key={idx} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">Rights Package: {item.rights}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        {item.status}
                      </span>
                      <span className="text-lg font-mono text-cyan-400 font-extrabold">{item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 3: GLOBAL BUYER */}
        {currentRole === "global_buyer" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
              <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                  🌐 Global Buyer Workspace
                </h1>
                <p className="text-base text-slate-300 mt-2">
                  Browse rights-cleared catalogues, watch watermarked screeners, and submit B2B licensing offers.
                </p>
              </div>
              <input 
                type="text" 
                placeholder="Search by title, territory, genre..."
                className="bg-slate-950 border border-slate-700 text-sm font-medium rounded-xl px-4 py-3 text-white placeholder-slate-500 w-full sm:w-80 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-white mb-6">Active B2B Deal Room</h3>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">Offer Pending Negotiation</span>
                  <h4 className="text-2xl font-extrabold text-white mt-1">Jananam 1947 Pranayam Thudarunnu</h4>
                  <p className="text-sm text-slate-400 mt-1 font-medium">Target Territory: North America SVOD • Licensing Period: 3 Years</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">$35,000 USD</span>
                  <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer">
                    Review Terms & Lock Escrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 4: INVESTOR */}
        {currentRole === "investor" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                💼 Investor Workspace
              </h1>
              <p className="text-base text-slate-300 mt-2">
                Track live earnings, portfolio ROI metrics, and inspect transparent studio audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Portfolio Gross Revenue</span>
                <h3 className="text-4xl font-black text-white mt-2">$142,850</h3>
                <span className="text-xs text-emerald-400 font-bold mt-3 inline-block">+18.4% this quarter</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Funded Projects</span>
                <h3 className="text-4xl font-black text-cyan-400 mt-2">4 Titles</h3>
                <span className="text-xs text-slate-400 mt-3 inline-block font-medium">2 in distribution</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Net Royalty ROI</span>
                <h3 className="text-4xl font-black text-emerald-400 mt-2">24.2%</h3>
                <span className="text-xs text-slate-400 mt-3 inline-block font-medium">Direct escrow payout</span>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 5: CONSUMER / CRAYONS LOOP */}
        {currentRole === "consumer" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                📺 Consumer / Viewer (Crayons Loop)
              </h1>
              <p className="text-base text-slate-300 mt-2">
                Stream feature films, web series & vertical video shorts via subscription, ad-supported, or pay-per-view.
              </p>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800 shadow-2xl">
              <div className="text-center p-8">
                <Tv size={56} className="mx-auto text-cyan-400 opacity-80 mb-4" />
                <h3 className="text-2xl font-bold text-white">Crayons Loop Streaming Player</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                  High quality adaptive HLS video player with multi-language subtitle tracks.
                </p>
                <button className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-7 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg cursor-pointer">
                  <Play size={16} fill="currentColor" /> Start Streaming Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 6: ADMIN OS */}
        {currentRole === "admin_os" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                🛡️ Admin OS — Platform Operations
              </h1>
              <p className="text-base text-slate-300 mt-2">
                Central control for Legal clearance, Technical QC, Matchmaker buyer distribution, and Finance escrow payouts.
              </p>

              {/* Admin OS Sub-Roles Navigation Tabs */}
              <div className="flex items-center gap-3 mt-8 border-b border-slate-800 pb-3 flex-wrap">
                {[
                  { id: "legal", label: "⚖️ Legal Admin", sub: "Chain-of-title clearance" },
                  { id: "qc", label: "🔍 QC Admin", sub: "Audio/Video specs" },
                  { id: "matchmaker", label: "🎯 Matchmaker Admin", sub: "Buyer matchmaking" },
                  { id: "finance", label: "💳 Finance Admin", sub: "Escrow & payouts" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      adminTab === tab.id
                        ? "bg-cyan-500 text-slate-950 shadow-md font-extrabold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Role Detail Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-md">
              {adminTab === "legal" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-xl">Legal Admin — Chain-of-Title Audit</h3>
                  <p className="text-sm text-slate-300 font-medium">Inspect copyright registration, music cue sheets, and talent release contracts.</p>
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200">Imran 3:185 — Copyright Clearance #CR-2024-881</span>
                    <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">VERIFIED</span>
                  </div>
                </div>
              )}

              {adminTab === "qc" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-xl">QC Admin — Technical Quality Control</h3>
                  <p className="text-sm text-slate-300 font-medium">Verify ProRes/DNxHR master specs, 5.1 surround audio mix & EBU R128 loudness standards.</p>
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200">Jananam 1947 — 4K ProRes 422 HQ Master</span>
                    <span className="text-cyan-400 font-extrabold bg-cyan-500/10 px-3 py-1 rounded-md border border-cyan-500/20">QC PASSED</span>
                  </div>
                </div>
              )}

              {adminTab === "matchmaker" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-xl">Matchmaker Admin — Buyer Catalog Placement</h3>
                  <p className="text-sm text-slate-300 font-medium">Curate titles and match rights packages directly to buyer demand lists.</p>
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200">Matched: Amazon Prime Video (Malayalam SVOD Slate)</span>
                    <span className="text-purple-400 font-extrabold bg-purple-500/10 px-3 py-1 rounded-md border border-purple-500/20">MATCH SENT</span>
                  </div>
                </div>
              )}

              {adminTab === "finance" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-xl">Finance Admin — Escrow & Instant Payout Dispatch</h3>
                  <p className="text-sm text-slate-300 font-medium">Manage buyer escrow deposits and dispatch instant direct payouts to content owners.</p>
                  <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-200">Escrow Tx #ESC-9921 — $35,000 USD (Prime Video Deal)</span>
                    <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">DISPATCH READY</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
