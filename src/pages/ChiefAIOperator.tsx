import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  ExternalLink,
  Film,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

const LOVABLE_BILLING_URL = "https://lovable.dev/settings/billing";
const LOVABLE_BILLING_TEST_KEY = "lovable_billing_link_tested";

const agents = [
  { name: "Chief Operator", role: "Priority + orchestration", status: "Active", icon: Sparkles },
  { name: "Revenue Agent", role: "Deals + cash pipeline", status: "Active", icon: CircleDollarSign },
  { name: "Content Agent", role: "Licensing + buyers", status: "Active", icon: Film },
  { name: "DevOps Agent", role: "GitHub + deploy recovery", status: "Ready", icon: Code2 },
  { name: "Product Agent", role: "Build + product execution", status: "Ready", icon: Layers3 },
  { name: "Research Agent", role: "Market intelligence", status: "Ready", icon: Globe2 },
];

const priorities = [
  {
    rank: "01",
    title: "Immediate Revenue",
    subtitle: "Crayons Bridge licensing + active buyer conversations",
    signal: "Highest value",
    icon: CircleDollarSign,
  },
  {
    rank: "02",
    title: "Fast Cash Service",
    subtitle: "DevOps Audit & Rescue — GitHub → Vercel → Cloudflare",
    signal: "Launch now",
    icon: Rocket,
  },
  {
    rank: "03",
    title: "StreamVista Platform",
    subtitle: "Production blockers, core product and reusable infrastructure",
    signal: "Build asset",
    icon: Layers3,
  },
  {
    rank: "04",
    title: "Union Auto AI",
    subtitle: "Billing, stock, purchase and receivable automation",
    signal: "Internal scale",
    icon: BriefcaseBusiness,
  },
];

const executionQueue = [
  { task: "Package DevOps Audit offer", owner: "Revenue Agent", status: "Ready" },
  { task: "Create GitHub audit checklist", owner: "DevOps Agent", status: "Ready" },
  { task: "Map Vercel deployment diagnostics", owner: "DevOps Agent", status: "Ready" },
  { task: "Map Cloudflare DNS / SSL checks", owner: "DevOps Agent", status: "Ready" },
  { task: "Prepare first client audit report format", owner: "Chief Operator", status: "Ready" },
];

const connections = [
  { name: "GitHub", state: "Connected", icon: GitBranch },
  { name: "Vercel", state: "Connected", icon: Rocket },
  { name: "Cloudflare", state: "Planned", icon: Cloud },
  { name: "Gmail", state: "Available", icon: Radio },
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
      {children}
    </span>
  );
}

export default function ChiefAIOperator() {
  const [lovableBillingTested, setLovableBillingTested] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.sessionStorage.getItem(LOVABLE_BILLING_TEST_KEY));
  });

  const recordLovableBillingNavigationTest = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(LOVABLE_BILLING_TEST_KEY, new Date().toISOString());
    }
    setLovableBillingTested(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur xl:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusPill>OPERATOR ONLINE</StatusPill>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">StreamVista AI Workforce</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Chief AI Operator</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
              One command layer for revenue, content licensing, product execution and infrastructure recovery. Priority is decided by money impact, urgency and execution speed.
            </p>
          </div>

          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Bot size={16} /> Active agents</div>
              <div className="mt-2 text-3xl font-bold text-white">6</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Target size={16} /> Top priority</div>
              <div className="mt-2 text-lg font-bold text-white">Revenue</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.045] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
              <ShieldCheck size={18} /> Owner Action · Lovable Exit
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Downgrade/cancel paid plan only. Do not delete account or projects.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This button records only that the billing page navigation was tested. It never marks the subscription as cancelled.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <a
              href={LOVABLE_BILLING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={recordLovableBillingNavigationTest}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
              aria-label="End Lovable Paid Plan — open Lovable billing settings in a new tab"
            >
              End Lovable Paid Plan <ExternalLink size={16} />
            </a>
            {lovableBillingTested && (
              <div role="status" className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <CheckCircle2 size={14} /> Billing link opened — navigation test passed
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Gauge size={18} /> Priority Engine</div>
              <p className="mt-1 text-sm text-slate-500">Current execution order</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Live Queue</span>
          </div>

          <div className="space-y-3">
            {priorities.map((item) => (
              <div key={item.rank} className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-black/20 p-4 transition hover:border-white/15 hover:bg-white/[0.045]">
                <div className="text-sm font-black text-slate-600">{item.rank}</div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-gold">
                  <item.icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="mt-1 truncate text-sm text-slate-500">{item.subtitle}</div>
                </div>
                <div className="hidden text-xs font-semibold text-slate-400 md:block">{item.signal}</div>
                <ArrowRight size={17} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Workflow size={18} /> Execution Logic</div>
          <div className="mt-5 space-y-3">
            {["Inspect", "Audit", "Diagnose", "Execute", "Verify", "Continue"].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-gold/20 bg-brand-gold/10 text-xs font-bold text-brand-gold">{index + 1}</div>
                <div className="text-sm font-medium text-slate-200">{step}</div>
                {index < 5 && <div className="ml-auto h-px w-8 bg-white/10" />}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
              <div>
                <div className="text-sm font-semibold text-amber-100">Owner intervention only for real blockers</div>
                <div className="mt-1 text-xs leading-5 text-amber-100/60">Login approval, payment, legal consent, destructive actions or unavailable permissions.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Agent Registry</h2>
            <p className="mt-1 text-sm text-slate-500">Specialist workforce managed by the Chief Operator</p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex"><Activity size={15} /> realtime-ready architecture</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.name} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-brand-gold"><agent.icon size={20} /></div>
                <StatusPill>{agent.status}</StatusPill>
              </div>
              <div className="mt-5 font-semibold text-white">{agent.name}</div>
              <div className="mt-1 text-sm text-slate-500">{agent.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Execution Queue</h2>
              <p className="mt-1 text-sm text-slate-500">Chief Operator V1 launch tasks</p>
            </div>
            <span className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300">{executionQueue.length} tasks</span>
          </div>

          <div className="divide-y divide-white/5">
            {executionQueue.map((item) => (
              <div key={item.task} className="flex items-center gap-3 py-3.5">
                <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-200">{item.task}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.owner}</div>
                </div>
                <span className="text-xs font-semibold text-emerald-300">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-white"><ShieldCheck size={19} /> Connected Systems</div>
          <div className="space-y-3">
            {connections.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300"><item.icon size={18} /></div>
                <div className="flex-1 text-sm font-semibold text-white">{item.name}</div>
                <div className={`text-xs font-semibold ${item.state === "Connected" || item.state === "Available" ? "text-emerald-300" : "text-amber-300"}`}>{item.state}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
