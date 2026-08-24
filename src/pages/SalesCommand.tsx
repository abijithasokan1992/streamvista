import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CircleDollarSign, Loader2, ShieldCheck, Target, Users } from "lucide-react";
import { loadSalesCommandSnapshot, type SalesCommandSnapshot, type SalesLead } from "../services/sales";

type FounderStatus = "close" | "follow" | "later";

function founderStatus(lead: SalesLead): FounderStatus {
  if (lead.priority === "P0" || lead.agent_lane === "hot" || ["opportunity", "negotiation"].includes(lead.stage)) return "close";
  if (lead.priority === "P1" || ["qualified", "outreach_ready", "contacted", "engaged"].includes(lead.stage)) return "follow";
  return "later";
}

function formatNextAction(value: string | null) {
  if (!value) return "No date set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date needs review";
  return parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const statusMeta: Record<FounderStatus, { label: string; className: string }> = {
  close: { label: "🟢 CLOSE NOW", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  follow: { label: "🟡 FOLLOW UP", className: "border-amber-200 bg-amber-50 text-amber-800" },
  later: { label: "⚪ LATER", className: "border-slate-200 bg-slate-50 text-slate-600" },
};

function LeadCard({ lead }: { lead: SalesLead }) {
  const status = founderStatus(lead);
  const meta = statusMeta[status];
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-950">{lead.company_name}</h3>
          <p className="mt-1 text-sm text-slate-500">{lead.contact_name || lead.email || "Contact not verified"}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><span className="text-slate-400">Interest</span><p className="mt-1 font-medium text-slate-700">{lead.content_interest || lead.rights_interest || "Needs discovery"}</p></div>
        <div><span className="text-slate-400">Rights</span><p className="mt-1 font-medium text-slate-700">{lead.rights_status}</p></div>
        <div><span className="text-slate-400">Model</span><p className="mt-1 font-medium text-slate-700">{lead.license_model || "Not defined"}</p></div>
        <div><span className="text-slate-400">Score</span><p className="mt-1 font-medium text-slate-700">{lead.total_score}/100 · Grade {lead.grade}</p></div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next best action</p>
        <p className="mt-2 text-sm font-medium text-slate-800">{lead.next_best_action || "Research and qualify before outreach."}</p>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarClock size={14}/>{formatNextAction(lead.next_action_at)}</p>
      </div>

      {lead.approval_required && <p className="mt-3 flex items-center gap-2 text-xs font-medium text-violet-700"><ShieldCheck size={14}/> Founder approval required before consequential external action.</p>}
    </article>
  );
}

export default function SalesCommand() {
  const [snapshot, setSnapshot] = useState<SalesCommandSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadSalesCommandSnapshot()
      .then((result) => { if (active) setSnapshot(result); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : "Sales data is unavailable."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const groups = useMemo(() => {
    const empty: Record<FounderStatus, SalesLead[]> = { close: [], follow: [], later: [] };
    for (const lead of snapshot?.leads || []) empty[founderStatus(lead)].push(lead);
    return empty;
  }, [snapshot]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-slate-500"><Loader2 className="mr-2 animate-spin" size={20}/>Loading verified sales pipeline…</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <div className="flex items-center gap-3"><AlertTriangle size={22}/><h1 className="text-xl font-semibold">Sales Agent data access is not active yet</h1></div>
      <p className="mt-3 max-w-3xl text-sm leading-6">{error}</p>
      <p className="mt-2 text-sm">The UI fails closed. No lead, deal, approval, or payment data is fabricated when Supabase access is unavailable.</p>
    </div>;
  }

  const opportunities = snapshot?.opportunities || [];
  const tasks = snapshot?.tasks || [];
  const approvals = tasks.filter((task) => task.status === "awaiting_approval").length;

  return <div className="space-y-8 text-slate-950">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">StreamVista Sales Agent</p>
        <h1 className="display-title mt-2">Sell what the buyer actually needs.</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Research first, match verified rights, communicate value clearly, then keep every open opportunity on a next action. External commitments remain approval-gated.</p>
      </div>
      <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">Read-only command view</div>
    </header>

    <section className="grid gap-4 md:grid-cols-4">
      <article className="metric-card"><span><Target size={18}/></span><p>Close now</p><strong>{groups.close.length}</strong><small>Highest-intent opportunities</small></article>
      <article className="metric-card"><span><Users size={18}/></span><p>Follow up</p><strong>{groups.follow.length}</strong><small>Active conversations</small></article>
      <article className="metric-card"><span><CircleDollarSign size={18}/></span><p>Opportunities</p><strong>{opportunities.length}</strong><small>Commercial records</small></article>
      <article className="metric-card"><span><ShieldCheck size={18}/></span><p>Approvals</p><strong>{approvals}</strong><small>Waiting for Founder gate</small></article>
    </section>

    <section className="space-y-4">
      <div><p className="eyebrow">Founder view</p><h2 className="mt-1 text-2xl font-semibold">🟢 CLOSE NOW</h2></div>
      {groups.close.length ? <div className="grid gap-4 xl:grid-cols-2">{groups.close.map((lead) => <LeadCard key={lead.id} lead={lead}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No verified close-now lead is visible.</p>}
    </section>

    <section className="space-y-4">
      <div><p className="eyebrow">Keep moving</p><h2 className="mt-1 text-2xl font-semibold">🟡 FOLLOW UP</h2></div>
      {groups.follow.length ? <div className="grid gap-4 xl:grid-cols-2">{groups.follow.map((lead) => <LeadCard key={lead.id} lead={lead}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No follow-up lead is visible.</p>}
    </section>

    <section className="space-y-4">
      <div><p className="eyebrow">Do not lose them</p><h2 className="mt-1 text-2xl font-semibold">⚪ LATER</h2></div>
      {groups.later.length ? <div className="grid gap-4 xl:grid-cols-2">{groups.later.slice(0, 24).map((lead) => <LeadCard key={lead.id} lead={lead}/>)}</div> : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No later/watchlist lead is visible.</p>}
      {groups.later.length > 24 && <p className="text-sm text-slate-500">Showing the first 24 later-stage leads. The full set remains in the canonical sales database.</p>}
    </section>
  </div>;
}
