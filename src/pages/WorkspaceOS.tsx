import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { NotificationBell } from "../components/NotificationBell";
import { 
  Film, 
  Upload, 
  ShieldCheck, 
  Scale, 
  DollarSign, 
  Users, 
  Tv, 
  Briefcase, 
  BarChart3, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Plus, 
  FileText, 
  Lock, 
  Download, 
  Search,
  Filter,
  Eye,
  LogOut,
  Layers
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
    { id: "creator", name: "🎬 Creator Workspace", icon: Film, color: "bg-cyan-500" },
    { id: "studio_producer", name: "🏢 Studio / Producer", icon: Briefcase, color: "bg-blue-500" },
    { id: "global_buyer", name: "🌐 Global Buyer", icon: Search, color: "bg-emerald-500" },
    { id: "investor", name: "💼 Investor Workspace", icon: DollarSign, color: "bg-purple-500" },
    { id: "consumer", name: "📺 Consumer (Crayons Loop)", icon: Tv, color: "bg-orange-500" },
    { id: "admin_os", name: "🛡️ Admin OS", icon: ShieldCheck, color: "bg-rose-500" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. OS Top Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20">
              SV
            </div>
            <span className="font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              StreamVista <span className="text-[10px] bg-slate-800 text-cyan-400 border border-slate-700 px-1.5 py-0.5 rounded font-mono ml-1">OS</span>
            </span>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Workspace Switcher Selector */}
          <div className="relative">
            <select 
              value={currentRole}
              onChange={(e) => handleWorkspaceChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition-all"
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

          <div className="h-5 w-px bg-slate-800" />

          <button 
            onClick={() => navigate("/")}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={14} /> Exit OS
          </button>
        </div>
      </header>

      {/* 2. 4-Step Pipeline Progress Banner */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] font-bold">
            4-Step B2B Pipeline:
          </span>

          <div className="flex items-center gap-2 sm:gap-6">
            {[
              { num: 1, label: "Upload Assets" },
              { num: 2, label: "Legal & QC Verify" },
              { num: 3, label: "Deal Room & Escrow" },
              { num: 4, label: "Dispatch & Payout" }
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setPipelineStep(step.num as any)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                  pipelineStep === step.num
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : pipelineStep > step.num
                    ? "text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  pipelineStep === step.num
                    ? "bg-cyan-500 text-slate-950"
                    : pipelineStep > step.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {pipelineStep > step.num ? <CheckCircle2 size={12} /> : step.num}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Workspace Stage Canvas */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* WORKSPACE VIEW 1: CREATOR */}
        {currentRole === "creator" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  🎬 Creator Workspace
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Upload vertical clips, feature films, scripts & music. Set rights terms and trigger promo boosts.
                </p>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all">
                <Plus size={16} /> New Asset Submission
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Film size={20} />
                </div>
                <h3 className="font-semibold text-white">Vertical & Short Videos</h3>
                <p className="text-xs text-slate-400">Ingest vertical clips, trailers, and promo reels for instant buyer preview.</p>
                <button className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-md transition-colors">
                  Upload Video Clip
                </button>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h3 className="font-semibold text-white">Scripts & Music Specs</h3>
                <p className="text-xs text-slate-400">Register screenplays, audio dubbing stems, and background score tracks.</p>
                <button className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-md transition-colors">
                  Upload Script / Audio
                </button>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-semibold text-white">Promo Boost Store</h3>
                <p className="text-xs text-slate-400">Promote your catalogue directly on Global Buyer screening dashboards.</p>
                <button className="w-full text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 py-2 rounded-md transition-colors font-semibold">
                  Buy Promo Boost
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 2: STUDIO / PRODUCER */}
        {currentRole === "studio_producer" && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🏢 Studio / Producer Workspace
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage full film slates, camera RAW vaults, censor certificates & studio payout accounts.
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Active Production Slate</h3>
              <div className="divide-y divide-slate-800">
                {[
                  { title: "Imran 3:185", status: "QC Approved", rights: "Worldwide OTT", revenue: "$24,500" },
                  { title: "Jananam 1947 Pranayam Thudarunnu", status: "Deal Room Active", rights: "SVOD / Satellite", revenue: "$48,200" }
                ].map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400">Rights: {item.rights}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                        {item.status}
                      </span>
                      <span className="text-sm font-mono text-cyan-300 font-bold">{item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 3: GLOBAL BUYER */}
        {currentRole === "global_buyer" && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  🌐 Global Buyer Workspace
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Browse rights-cleared catalogues, watch watermarked screeners, and submit B2B licensing offers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Search by title, territory, genre..."
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white placeholder-slate-500 w-64"
                />
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Active B2B Deal Room</h3>
              <div className="p-4 bg-slate-900/60 border border-slate-700/60 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Offer Pending Negotiation</span>
                  <h4 className="text-xl font-bold text-white mt-0.5">Jananam 1947 Pranayam Thudarunnu</h4>
                  <p className="text-xs text-slate-400 mt-1">Target Territory: North America SVOD • Licensing Period: 3 Years</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-400 font-mono">$35,000 USD</span>
                  <button className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                    Review Terms & Lock Escrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 4: INVESTOR */}
        {currentRole === "investor" && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                💼 Investor Workspace
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Track live earnings, portfolio ROI metrics, and inspect transparent studio audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <span className="text-xs text-slate-400 font-medium">Portfolio Gross Revenue</span>
                <h3 className="text-3xl font-extrabold text-white mt-1">$142,850</h3>
                <span className="text-xs text-emerald-400 font-bold mt-2 inline-block">+18.4% this quarter</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <span className="text-xs text-slate-400 font-medium">Active Funded Projects</span>
                <h3 className="text-3xl font-extrabold text-cyan-300 mt-1">4 Titles</h3>
                <span className="text-xs text-slate-400 mt-2 inline-block">2 in distribution</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
                <span className="text-xs text-slate-400 font-medium">Net Royalty ROI</span>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">24.2%</h3>
                <span className="text-xs text-slate-400 mt-2 inline-block">Direct escrow payout</span>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 5: CONSUMER / CRAYONS LOOP */}
        {currentRole === "consumer" && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                📺 Consumer / Viewer (Crayons Loop)
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Stream feature films, web series & vertical video shorts via subscription, ad-supported, or pay-per-view.
              </p>
            </div>

            <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-800">
              <div className="text-center p-8">
                <Tv size={48} className="mx-auto text-cyan-400 opacity-60 mb-3" />
                <h3 className="text-xl font-bold text-white">Crayons Loop Streaming Player</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  High quality adaptive HLS video player with multi-language subtitle tracks.
                </p>
                <button className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all inline-flex items-center gap-2">
                  <Play size={14} fill="currentColor" /> Start Streaming Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW 6: ADMIN OS */}
        {currentRole === "admin_os" && (
          <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                🛡️ Admin OS — Platform Operations
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Central control for Legal clearance, Technical QC, Matchmaker buyer distribution, and Finance escrow payouts.
              </p>

              {/* Admin OS Sub-Roles Navigation Tabs */}
              <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-2">
                {[
                  { id: "legal", label: "⚖️ Legal Admin", sub: "Chain-of-title clearance" },
                  { id: "qc", label: "🔍 QC Admin", sub: "Audio/Video specs" },
                  { id: "matchmaker", label: "🎯 Matchmaker Admin", sub: "Buyer matchmaking" },
                  { id: "finance", label: "💳 Finance Admin", sub: "Escrow & payouts" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      adminTab === tab.id
                        ? "bg-cyan-500 text-slate-950 shadow"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Role Detail Panel */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
              {adminTab === "legal" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">Legal Admin — Chain-of-Title Audit</h3>
                  <p className="text-xs text-slate-400">Inspect copyright registration, music cue sheets, and talent release contracts.</p>
                  <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
                    <span>Imran 3:185 — Copyright Clearance #CR-2024-881</span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                </div>
              )}

              {adminTab === "qc" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">QC Admin — Technical Quality Control</h3>
                  <p className="text-xs text-slate-400">Verify ProRes/DNxHR master specs, 5.1 surround audio mix & EBU R128 loudness standards.</p>
                  <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
                    <span>Jananam 1947 — 4K ProRes 422 HQ Master</span>
                    <span className="text-cyan-400 font-bold">QC PASSED</span>
                  </div>
                </div>
              )}

              {adminTab === "matchmaker" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">Matchmaker Admin — Buyer Catalog Placement</h3>
                  <p className="text-xs text-slate-400">Curate titles and match rights packages directly to buyer demand lists.</p>
                  <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
                    <span>Matched: Amazon Prime Video (Malayalam SVOD Slate)</span>
                    <span className="text-purple-400 font-bold">MATCH SENT</span>
                  </div>
                </div>
              )}

              {adminTab === "finance" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-lg">Finance Admin — Escrow & Instant Payout Dispatch</h3>
                  <p className="text-xs text-slate-400">Manage buyer escrow deposits and dispatch instant direct payouts to content owners.</p>
                  <div className="p-4 bg-slate-900 rounded-lg flex items-center justify-between text-xs">
                    <span>Escrow Tx #ESC-9921 — $35,000 USD (Prime Video Deal)</span>
                    <span className="text-emerald-400 font-bold">DISPATCH READY</span>
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
