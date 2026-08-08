import { ArrowRight, Bot, Film, Globe2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Creators & Studios",
    text: "Prepare titles, rights, assets and delivery readiness in one focused workspace.",
    icon: Film,
    path: "/creator",
    action: "Open Creator",
  },
  {
    title: "Buyers & Licensing",
    text: "Discover rights-ready content and move through controlled review and licensing workflows.",
    icon: Globe2,
    path: "/buyer",
    action: "Open Buyer",
  },
  {
    title: "AI Operations",
    text: "Use StreamVista's private operating layer for agents, platform health and controlled execution.",
    icon: Bot,
    path: "/chief-ai-operator",
    action: "Open AI Workspace",
  },
];

export function LandingPageV2() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-black text-black">SV</div>
            <div>
              <div className="font-bold tracking-tight">StreamVista</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-slate-500">Media Business Platform</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/creator")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-slate-200"
            >
              Submit content
            </button>
          </div>
        </header>

        <main className="flex-1">
          <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr] lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
                <ShieldCheck size={14} /> Rights-first media operations
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Build. License. Distribute. Grow.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                StreamVista gives creators, studios, buyers and media teams one professional workspace for content readiness,
                rights control, licensing workflows and operations.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/workspace")}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
                >
                  Open Platform <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/buyer")}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
                >
                  Explore Buyer Workspace
                </button>
              </div>

              <p className="mt-5 max-w-2xl text-xs leading-5 text-slate-600">
                Licensing, distribution and revenue remain subject to rights verification, QC, buyer review and written commercial terms.
              </p>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Platform flow</p>
              <div className="mt-6 space-y-3">
                {["Content & metadata", "Rights & legal", "QC & readiness", "Buyer & deal workflow", "Delivery & reporting"].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="grid gap-4 border-t border-white/10 py-10 md:grid-cols-3">
            {features.map((feature) => (
              <button
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:border-amber-400/30 hover:bg-white/[0.045]"
              >
                <feature.icon size={22} className="text-amber-300" />
                <h2 className="mt-4 text-lg font-bold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                  {feature.action} <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </section>
        </main>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>StreamVista (OPC) Private Limited · Kerala, India</span>
          <div className="flex gap-4">
            <button onClick={() => navigate("/about")} className="hover:text-slate-300">About</button>
            <button onClick={() => navigate("/services")} className="hover:text-slate-300">Services</button>
            <button onClick={() => navigate("/contact")} className="hover:text-slate-300">Contact</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
