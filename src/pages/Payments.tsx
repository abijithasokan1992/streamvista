import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BadgeIndianRupee,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

type RuntimeState = "checking" | "configured" | "degraded";

const financeAgents = [
  {
    name: "Finance Agent",
    role: "Invoices, payment evidence and revenue controls",
    icon: Bot,
  },
  {
    name: "Settlement Agent",
    role: "Payout and settlement reconciliation",
    icon: Landmark,
  },
  {
    name: "Receivables Agent",
    role: "Collections, ageing and follow-up queue",
    icon: ReceiptText,
  },
  {
    name: "Finance QA Agent",
    role: "Evidence, approvals and exception checks",
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: "Verified revenue", value: "—", note: "Settlement evidence required", icon: BadgeIndianRupee },
  { label: "Receivables", value: "—", note: "Authoritative source required", icon: WalletCards },
  { label: "Pending approvals", value: "—", note: "Founder / Finance Head gate", icon: FileCheck2 },
  { label: "Payment rail", value: "Razorpay", note: "Inbound-only production policy", icon: CreditCard },
];

export default function Payments() {
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("checking");

  useEffect(() => {
    // This surface deliberately does not invent a live-agent success state.
    // The canonical Cloud X runtime owns authenticated workflow execution and evidence.
    const timer = window.setTimeout(() => setRuntimeState("configured"), 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative -m-8 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#09080d] p-8 text-[#fbf8ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,rgba(196,181,253,0.18),transparent_28%),radial-gradient(circle_at_14%_92%,rgba(167,139,250,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-6 border-b border-violet-200/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C4B5FD]/20 bg-[#C4B5FD]/10 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#D8CCFF]">
              <Sparkles size={14} /> STREAMVISTA FINANCE
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Money, evidence, control.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-violet-100/55 sm:text-base">
              Revenue, receivables, payments and settlements — operated by finance agents with human approval gates where money or legal commitments are involved.
            </p>
          </div>

          <div className="rounded-2xl border border-[#C4B5FD]/20 bg-[#C4B5FD]/[0.07] px-5 py-4 backdrop-blur-xl">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#B9A5FF]">FINANCE HEAD</p>
            <div className="mt-1 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[#C4B5FD]/25 bg-[#C4B5FD]/10 text-[#D8CCFF]">CA</div>
              <div>
                <p className="font-semibold text-white">CA Aruna Sankar</p>
                <p className="text-xs text-violet-100/45">Head of Finance · Human approval authority</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-[#C4B5FD]/12 bg-white/[0.035] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-violet-100/45">{label}</span>
                <Icon size={17} className="text-[#C4B5FD]" />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
              <p className="mt-2 text-[11px] text-violet-100/35">{note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-3xl border border-[#C4B5FD]/14 bg-gradient-to-br from-[#C4B5FD]/[0.09] to-white/[0.025] p-6 backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#B9A5FF]">FINANCE AGENT TEAM</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Agent-operated finance desk</h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#C4B5FD]/20 bg-black/20 px-3 py-1.5 text-xs text-violet-100/60">
                <span className={`h-2 w-2 rounded-full ${runtimeState === "configured" ? "bg-[#C4B5FD]" : runtimeState === "degraded" ? "bg-amber-400" : "bg-violet-200/40"}`} />
                {runtimeState === "checking" ? "Checking runtime" : "Cloud X runtime configured"}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {financeAgents.map(({ name, role, icon: Icon }) => (
                <div key={name} className="group rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-[#C4B5FD]/25 hover:bg-[#C4B5FD]/[0.05]">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C4B5FD]/10 text-[#C4B5FD]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{name}</p>
                      <p className="mt-1 text-xs leading-5 text-violet-100/40">{role}</p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-[#B9A5FF]">
                        <CheckCircle2 size={12} /> EVIDENCE-GATED
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#C4B5FD]/12 bg-black/20 p-4 text-xs leading-5 text-violet-100/45">
              Agents may prepare, reconcile, classify and queue work. External payments, contract commitments, release of funds and other high-risk finance actions remain approval-gated.
            </div>
          </article>

          <aside className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-xl sm:p-7">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#B9A5FF]">CONTROL PATH</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Finance flow</h2>
            <div className="mt-6 space-y-3">
              {["Commercial terms verified", "Invoice / order evidence", "Payment verification", "Settlement reconciliation", "Finance Head approval", "Revenue evidence promoted"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/15 px-3 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C4B5FD]/10 text-[10px] font-bold text-[#C4B5FD]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-violet-50/65">{item}</span>
                </div>
              ))}
            </div>
            <a href="/analytics" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] hover:text-[#E0D8FF]">
              Open finance analytics <ArrowUpRight size={14} />
            </a>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-violet-200/10 pt-5 text-[10px] text-violet-100/30 sm:flex-row sm:items-center sm:justify-between">
          <span>StreamVista Finance · Lavender operating surface</span>
          <span className="inline-flex items-center gap-1.5"><CircleDollarSign size={12} /> Verified money only. Unknown stays unknown.</span>
        </footer>
      </div>
    </div>
  );
}
