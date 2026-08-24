import { ArrowUpRight, CircleCheck, Clock3, IndianRupee, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  listDeals,
  listScreeningRequests,
  listTitlesByStatus,
  type Deal,
  type ScreeningRequest,
  type TitleStatus,
} from "../services/marketplace";

const ACTIVE_TITLE_STATUSES: TitleStatus[] = ["draft", "submitted", "qc", "approved", "licensed"];

export default function FounderCommand() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Record<TitleStatus, number>>({ draft: 0, submitted: 0, qc: 0, approved: 0, licensed: 0, archived: 0 });
  const [screenings, setScreenings] = useState<ScreeningRequest[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [titleResults, screeningResults, dealResults] = await Promise.all([
        Promise.all(ACTIVE_TITLE_STATUSES.map(async (status) => [status, await listTitlesByStatus(status)] as const)),
        listScreeningRequests(),
        listDeals(),
      ]);
      const next = { draft: 0, submitted: 0, qc: 0, approved: 0, licensed: 0, archived: 0 } as Record<TitleStatus, number>;
      for (const [status, rows] of titleResults) next[status] = rows.length;
      setTitles(next);
      setScreenings(screeningResults);
      setDeals(dealResults);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load verified production data.");
      setTitles({ draft: 0, submitted: 0, qc: 0, approved: 0, licensed: 0, archived: 0 });
      setScreenings([]);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, [user?.uid]);

  const approvalCount = titles.submitted + titles.qc;
  const screeningCount = screenings.filter((item) => item.status === "requested").length;
  const revenueQueue = deals.filter((deal) => deal.payment_status !== "paid").length;
  const queue = useMemo(() => [
    { priority: "P0", title: "Immediate close", detail: "Buyer licensing opportunities requiring action", count: deals.filter((deal) => deal.status === "requested" || deal.status === "negotiating").length, tone: "bg-orange-500" },
    { priority: "P1", title: "Immediate money", detail: "Deals with unpaid payment state", count: revenueQueue, tone: "bg-violet-600" },
    { priority: "P2", title: "Founder approvals", detail: "Submitted or QC titles awaiting decision", count: approvalCount, tone: "bg-black" },
  ], [deals, revenueQueue, approvalCount]);

  return <div className="space-y-8 text-slate-950">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">Founder command</p>
        <h1 className="display-title mt-2">One desk. Every decision.</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Verified workspace data for {user?.displayName || "the authenticated founder"}. No demo or synthetic metrics are used.</p>
      </div>
      <button className="primary-action"><Sparkles size={16}/> Ask StreamVista AI</button>
    </div>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><p className="font-bold">Production data unavailable</p><p className="mt-1">{error}</p><button type="button" onClick={() => void refresh()} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold">Retry</button></div>}

    <div className="grid gap-4 md:grid-cols-3">
      <article className="metric-card"><span><IndianRupee size={18}/></span><p>Revenue queue</p><strong>{loading ? "—" : `${revenueQueue} actions`}</strong><small>Derived from verified deal/payment state</small></article>
      <article className="metric-card"><span><Clock3 size={18}/></span><p>Founder approvals</p><strong>{loading ? "—" : `${approvalCount} ready`}</strong><small>Derived from submitted/QC titles</small></article>
      <article className="metric-card"><span><ShieldCheck size={18}/></span><p>Release health</p><strong>Evidence required</strong><small>Never reports green without runtime verification</small></article>
    </div>

    <section className="surface-card p-6">
      <div className="flex items-center justify-between"><div><p className="eyebrow">Priority queue</p><h2 className="mt-1 text-2xl font-semibold">What needs attention now</h2></div><CircleCheck className="text-violet-600"/></div>
      <div className="mt-6 divide-y divide-slate-200">
        {queue.map((item) => <div key={item.priority} className="flex items-center gap-4 py-5"><span className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white ${item.tone}`}>{item.priority}</span><div className="min-w-0 flex-1"><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-slate-500">{item.detail}</p></div><b className="text-2xl">{loading ? "—" : item.count}</b><ArrowUpRight size={18}/></div>)}
      </div>
      {!loading && !screeningCount && !approvalCount && !revenueQueue && <p className="mt-4 text-sm text-slate-500">No actionable production items are currently visible under the authenticated session and its RLS policies.</p>}
    </section>

    <div className="text-xs text-slate-400">Titles: {loading ? "—" : ACTIVE_TITLE_STATUSES.reduce((sum, status) => sum + titles[status], 0)} · Pending screenings: {loading ? "—" : screeningCount} · Authenticated user: {user?.email || "none"}</div>
  </div>;
}
