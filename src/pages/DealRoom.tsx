import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listTitlesByStatus, listDeals, requestLicense, Deal, MarketplaceTitle } from "../services/marketplace";
import { Button } from "../components/ui/Button";

export default function DealRoom() {
  const { titleId } = useParams<{ titleId: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState<MarketplaceTitle | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [approved, deals] = await Promise.all([listTitlesByStatus("approved"), listDeals()]);
        if (!active) return;
        setTitle(approved.find((item) => item.id === titleId) || null);
        setDeal(deals.find((item) => item.title_id === titleId && item.buyer_id === user?.uid) || null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load deal room");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (user) load();
    return () => { active = false; };
  }, [titleId, user]);

  async function startDeal() {
    if (!user || !title) return;
    setBusy(true); setError(null);
    try {
      const created = await requestLicense(user.uid, title);
      setDeal(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create deal");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-8 text-slate-300">Loading deal room…</div>;
  if (!title) return <div className="p-8 text-slate-300">Approved title not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wider text-slate-400">Marketplace / Deal Room</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{title.payload.title}</h1>
        <p className="mt-2 text-slate-300">Private commercial workspace for this title.</p>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900 p-5"><p className="text-xs text-slate-500">Offer</p><p className="mt-1 text-xl font-semibold text-white">{title.payload.price ? `₹${title.payload.price.toLocaleString()}` : "To be negotiated"}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-900 p-5"><p className="text-xs text-slate-500">Rights</p><p className="mt-1 text-white">{title.payload.rights.territory || "Not specified"}</p></div>
        <div className="rounded-xl border border-white/10 bg-slate-900 p-5"><p className="text-xs text-slate-500">Deal status</p><p className="mt-1 text-white">{deal?.status || "Not started"}</p></div>
      </div>
      {!deal ? <Button variant="primary" disabled={busy} onClick={startDeal}>{busy ? "Opening…" : "Start Deal"}</Button> : <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-200">Deal room active. Contract: {deal.contract_status}. Payment: {deal.payment_status}.</div>}
    </div>
  );
}
