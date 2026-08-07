import { ArrowRight, Bot, BriefcaseBusiness, Film, Globe2, Search, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const entryPoints = [
  {
    title: "I am a Creator",
    subtitle: "Upload content, manage rights, track reviews, deals and earnings.",
    icon: Film,
    action: "Upload my content",
    path: "/creator",
  },
  {
    title: "I am a Buyer",
    subtitle: "Discover rights-cleared content, review availability and manage licensing.",
    icon: Search,
    action: "Find content",
    path: "/buyer",
  },
  {
    title: "I am a Distributor",
    subtitle: "Manage catalogues, territories, deliveries, licences and revenue.",
    icon: Globe2,
    action: "Open distributor workspace",
    path: "/workspace?role=distributor",
  },
  {
    title: "AI Workspace",
    subtitle: "Private command center for agents, platform health, incidents and approvals.",
    icon: Bot,
    action: "Open AI Workspace",
    path: "/chief-ai-operator",
  },
];

const quickActions = [
  { label: "Upload My Content", icon: Upload, path: "/creator" },
  { label: "Find Content", icon: Search, path: "/buyer" },
  { label: "AI Workspace", icon: Bot, path: "/chief-ai-operator" },
  { label: "Track My Deals", icon: BriefcaseBusiness, path: "/workspace" },
];

export function LandingPageV2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A10]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-black">SV</div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">StreamVista</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Create · License · Distribute · Operate</div>
            </div>
          </button>

          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <button onClick={() => navigate("/buyer")} className="hover:text-white">Marketplace</button>
            <button onClick={() => navigate("/workspace")} className="hover:text-white">FAST</button>
            <button onClick={() => navigate("/workspace")} className="hover:text-white">Services</button>
            <button onClick={() => navigate("/login")} className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-white hover:bg-white/5">Login</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                <Sparkles size={14} /> StreamVista Media Operating System
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Welcome to StreamVista
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                Create. License. Distribute. Operate. Choose what you want to do and go directly to the right workflow.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {quickActions.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-left transition hover:border-amber-400/30 hover:bg-white/[0.06]"
                  >
                    <span className="flex items-center gap-3 font-semibold"><item.icon size={18} className="text-amber-300" />{item.label}</span>
                    <ArrowRight size={17} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Rights-first workflows</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Private AI operations</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {entryPoints.map((entry) => (
                <button
                  key={entry.title}
                  onClick={() => navigate(entry.path)}
                  className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-5 text-left shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-amber-400/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-amber-300">
                    <entry.icon size={21} />
                  </div>
                  <h2 className="mt-5 text-xl font-bold">{entry.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{entry.subtitle}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-amber-300">
                    {entry.action}<ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Choose a workflow, not a menu</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Everything starts with what you need to do today.</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="text-sm font-semibold text-white">Creator workflow</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Upload → Rights → Review → Marketplace → Deals → Earnings</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="text-sm font-semibold text-white">Buyer workflow</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Discover → Filter rights → Request licence → Deal room → Delivery</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="text-sm font-semibold text-white">AI operations</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Agents → Platform health → Incidents → Recovery → Verification</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-slate-600 lg:px-8">
        StreamVista · Media, licensing and AI operations in one workspace
      </footer>
    </div>
  );
}
