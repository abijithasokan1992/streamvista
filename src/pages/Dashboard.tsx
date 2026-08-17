import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock3, Film, Layers3, ListChecks, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { listScreeningRequests, listTitlesByStatus, setTitleStatus, updateScreeningStatus, type MarketplaceTitle, type ScreeningRequest, type TitleStatus } from "../services/marketplace";

const ACTIVE_TITLE_STATUSES: TitleStatus[] = ["draft", "submitted", "qc", "approved", "licensed"];
function isAdminRole(role?: string) { return role === "admin" || role === "founder" || role === "super_admin" || role === "platform_owner"; }
function isCreatorRole(role?: string) { return role === "creator_partner" || isAdminRole(role); }
function roleLabel(role?: string) { return (role || "unknown").replaceAll("_", " "); }

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const admin = isAdminRole(role);
  const [titlesByStatus, setTitlesByStatus] = useState<Record<TitleStatus, MarketplaceTitle[]>>({ draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] });
  const [screenings, setScreenings] = useState<ScreeningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [titleResults, screeningResults] = await Promise.all([
        Promise.all(ACTIVE_TITLE_STATUSES.map(async (status) => [status, await listTitlesByStatus(status)] as const)),
        listScreeningRequests(),
      ]);
      const next = { draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] } as Record<TitleStatus, MarketplaceTitle[]>;
      for (const [status, titles] of titleResults) next[status] = titles;
      setTitlesByStatus(next);
      setScreenings(screeningResults);
    } catch (loadError) {
      setTitlesByStatus({ draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] });
      setScreenings([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load workspace data.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [admin]);
  const requestedScreenings = useMemo(() => screenings.filter((screening) => screening.status === "requested"), [screenings]);
  const totalTitles = useMemo(() => ACTIVE_TITLE_STATUSES.reduce((count, status) => count + titlesByStatus[status].length, 0), [titlesByStatus]);
  const approvalQueue = [...titlesByStatus.qc, ...titlesByStatus.submitted].slice(0, 6);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Product workspace</p><h1 className="display-title mt-2">Welcome back, {user?.displayName || "StreamVista"}</h1><p className="mt-2 text-sm text-slate-500">{admin ? "Founder / administration workspace" : "Your StreamVista workspace"} · data access is protected by RBAC + RLS.</p></div><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /><span className="font-semibold capitalize text-slate-800">{roleLabel(role)}</span></div></header>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><p className="font-bold">Workspace data could not be loaded.</p><p className="mt-1">{error}</p><button type="button" onClick={() => void refresh()} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold">Retry</button></div>}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard icon={<Film size={19} />} label="Total Titles" value={loading ? "—" : String(totalTitles)} detail="Active workflow titles" href="/titles" /><MetricCard icon={<Layers3 size={19} />} label="Active Drafts" value={loading ? "—" : String(titlesByStatus.draft.length)} detail="Titles currently in preparation" href="/drafts" /><MetricCard icon={<ListChecks size={19} />} label="Pending Screenings" value={loading ? "—" : String(requestedScreenings.length)} detail="Buyer requests awaiting action" href="/screenings" /></section>
      {isCreatorRole(role) && !admin && <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Creator workspace</p><h2 className="mt-1 text-xl font-bold text-slate-950">Move a title from idea to delivery.</h2><p className="mt-1 text-sm text-slate-600">Create metadata, upload the film assets, then submit the title into QC.</p></div><Link to="/drafts" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">Open Drafts <ArrowRight size={16} /></Link></div></section>}
      {role === "buyer" && <section className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Buyer workspace</p><h2 className="mt-1 text-xl font-bold text-slate-950">Screening access stays fail-closed until approved.</h2><div className="mt-4 flex flex-wrap gap-2"><Link to="/buyer" className="rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">Buyer hub</Link><Link to="/screenings" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">Screenings</Link></div></section>}
      {admin && <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]"><Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Founder approval queue</CardTitle><p className="mt-1 text-sm text-slate-500">Submitted and QC-stage titles requiring the next controlled decision.</p></div><ShieldCheck className="text-violet-600" size={21} /></div></CardHeader><CardContent className="space-y-2">{approvalQueue.map((title) => <div key={title.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{title.payload.title || "Untitled"}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{title.status} · {title.payload.language || "Language not set"}</p></div><button type="button" onClick={() => void setTitleStatus(title.id, "approved").then(refresh)} className="shrink-0 rounded-lg bg-[#FFC700] px-3 py-2 text-xs font-bold text-black transition hover:brightness-95">Approve</button></div>)}{!approvalQueue.length && <EmptyState label="No titles are waiting for founder approval." />}</CardContent></Card><Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Screening approvals</CardTitle><p className="mt-1 text-sm text-slate-500">Buyer access requests visible under current RLS.</p></div><Clock3 className="text-amber-600" size={21} /></div></CardHeader><CardContent className="space-y-2">{requestedScreenings.slice(0, 5).map((screening) => <div key={screening.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">Title {screening.title_id.slice(0, 8)}</p><p className="text-xs text-slate-500">Buyer {screening.buyer_id.slice(0, 8)} · requested</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => void updateScreeningStatus(screening.id, "approved").then(refresh)} className="rounded-lg bg-[#FFC700] px-3 py-2 text-xs font-bold">Approve</button><button type="button" onClick={() => void updateScreeningStatus(screening.id, "declined").then(refresh)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Decline</button></div></div>)}{!requestedScreenings.length && <EmptyState label="No screening requests are waiting for approval." />}</CardContent></Card></section>}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4"><QuickLink href="/titles" label="Titles" detail="Library & metadata" /><QuickLink href="/uploads" label="Uploads" detail="Media ingest" /><QuickLink href="/qc" label="QC Review" detail="Quality gate" /><QuickLink href="/finance" label="Payments & Revenue" detail="Commercial control" /></section>
      {!admin && !isCreatorRole(role) && role !== "buyer" && <EmptyState label="This role has a limited workspace. Contact an administrator for additional access." />}
    </div>
  );
}

function MetricCard({ icon, label, value, detail, href }: { icon: ReactNode; label: string; value: string; detail: string; href: string }) { return <Link to={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">{icon}</span><ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-500" /></div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-4xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></Link>; }
function QuickLink({ href, label, detail }: { href: string; label: string; detail: string }) { return <Link to={href} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-200 hover:bg-violet-50/40"><div className="flex items-center gap-2 text-sm font-bold text-slate-900"><CheckCircle2 size={16} className="text-emerald-600" />{label}</div><p className="mt-1 text-xs text-slate-500">{detail}</p></Link>; }
function EmptyState({ label }: { label: string }) { return <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{label}</p>; }
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock3, Film, Layers3, ListChecks, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { listScreeningRequests, listTitlesByStatus, setTitleStatus, updateScreeningStatus, type MarketplaceTitle, type ScreeningRequest, type TitleStatus } from "../services/marketplace";

const ACTIVE_TITLE_STATUSES: TitleStatus[] = ["draft", "submitted", "qc", "approved", "licensed"];
function isAdminRole(role?: string) { return role === "admin" || role === "founder" || role === "super_admin" || role === "platform_owner"; }
function isCreatorRole(role?: string) { return role === "creator_partner" || isAdminRole(role); }
function roleLabel(role?: string) { return (role || "unknown").replaceAll("_", " "); }

// === ഈ രണ്ട് ഹെൽപർ കംപോണന്റുകൾ കൂടിയുണ്ടെങ്കിലേ കോഡ് പൂർണ്ണമാകൂ ===
function MetricCard({ icon, label, value, detail, href }: { icon: ReactNode; label: string; value: string; detail: string; href: string }) {
  return (
    <Link to={href} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="text-slate-500">{icon}</div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center">
      <CheckCircle2 className="h-6 w-6 text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const admin = isAdminRole(role);
  const [titlesByStatus, setTitlesByStatus] = useState<Record<TitleStatus, MarketplaceTitle[]>>({ draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] });
  const [screenings, setScreenings] = useState<ScreeningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [titleResults, screeningResults] = await Promise.all([
        Promise.all(ACTIVE_TITLE_STATUSES.map(async (status) => [status, await listTitlesByStatus(status)] as const)),
        listScreeningRequests(),
      ]);
      const next = { draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] } as Record<TitleStatus, MarketplaceTitle[]>;
      for (const [status, titles] of titleResults) next[status] = titles;
      setTitlesByStatus(next);
      setScreenings(screeningResults);
    } catch (loadError) {
      setTitlesByStatus({ draft: [], submitted: [], qc: [], approved: [], licensed: [], archived: [] });
      setScreenings([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load workspace data.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [admin]);
  const requestedScreenings = useMemo(() => screenings.filter((screening) => screening.status === "requested"), [screenings]);
  const totalTitles = useMemo(() => ACTIVE_TITLE_STATUSES.reduce((count, status) => count + titlesByStatus[status].length, 0), [titlesByStatus]);
  const approvalQueue = [...titlesByStatus.qc, ...titlesByStatus.submitted].slice(0, 6);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Product workspace</p><h1 className="display-title mt-2">Welcome back, {user?.displayName || "StreamVista"}</h1><p className="mt-2 text-sm text-slate-500">{admin ? "Founder / administration workspace" : "Your StreamVista workspace"} · data access is protected by RBAC + RLS.</p></div><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"><span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /><span className="font-semibold capitalize text-slate-800">{roleLabel(role)}</span></div></header>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><p className="font-bold">Workspace data could not be loaded.</p><p className="mt-1">{error}</p><button type="button" onClick={() => void refresh()} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold">Retry</button></div>}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard icon={<Film size={19} />} label="Total Titles" value={loading ? "—" : String(totalTitles)} detail="Active workflow titles" href="/titles" /><MetricCard icon={<Layers3 size={19} />} label="Active Drafts" value={loading ? "—" : String(titlesByStatus.draft.length)} detail="Titles currently in preparation" href="/drafts" /><MetricCard icon={<ListChecks size={19} />} label="Pending Screenings" value={loading ? "—" : String(requestedScreenings.length)} detail="Buyer requests awaiting action" href="/screenings" /></section>
      {isCreatorRole(role) && !admin && <section className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Creator workspace</p><h2 className="mt-1 text-xl font-bold text-slate-950">Move a title from idea to delivery.</h2><p className="mt-1 text-sm text-slate-600">Create metadata, upload the film assets, then submit the title into QC.</p></div><Link to="/drafts" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">Open Drafts <ArrowRight size={16} /></Link></div></section>}
      {role === "buyer" && <section className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">Buyer workspace</p><h2 className="mt-1 text-xl font-bold text-slate-950">Screening access stays fail-closed until approved.</h2><div className="mt-4 flex flex-wrap gap-2"><Link to="/buyer" className="rounded-xl bg-[#150b20] px-4 py-2.5 text-sm font-bold text-white">Buyer hub</Link><Link to="/screenings" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800">Screenings</Link></div></section>}
      {admin && <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]"><Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Founder approval queue</CardTitle><p className="mt-1 text-sm text-slate-500">Submitted and QC-stage titles requiring the next controlled decision.</p></div><ShieldCheck className="text-violet-600" size={21} /></div></CardHeader><CardContent className="space-y-2">{approvalQueue.map((title) => <div key={title.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{title.payload.title || "Untitled"}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{title.status} · {title.payload.language || "Language not set"}</p></div><button type="button" onClick={() => void setTitleStatus(title.id, "approved").then(refresh)} className="shrink-0 rounded-lg bg-[#FFC700] px-3 py-2 text-xs font-bold text-black transition hover:brightness-95">Approve</button></div>)}{!approvalQueue.length && <EmptyState label="No titles are waiting for founder approval." />}</CardContent></Card><Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Screening approvals</CardTitle><p className="mt-1 text-sm text-slate-500">Buyer access requests visible under current RLS.</p></div><Clock3 className="text-amber-600" size={21} /></div></CardHeader><CardContent className="space-y-2">{requestedScreenings.slice(0, 5).map((screening) => <div key={screening.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">Title {screening.title_id.slice(0, 8)}</p><p className="text-xs text-slate-500">Buyer {screening.buyer_id.slice(0, 8)} · requested</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => void updateScreeningStatus(screening.id, "approved").then(refresh)} className="rounded-lg bg-[#FFC700] px-3 py-2 text-xs font-bold">Approve</button><button type="button" onClick={() => void updateScreeningStatus(screening.id, "declined").then(refresh)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Decline</button></div></div>)}{!requestedScreenings.length && <EmptyState label="No screening requests pending." />}</CardContent></Card></section>}
    </div>
  );
}
