import { useEffect, useState } from "react";
import { listDeals, type Deal } from "../services/marketplace";

const FALLBACK_LEDGER: Deal[] = [];

export default function Payments() {
  const [deals, setDeals] = useState<Deal[]>(FALLBACK_LEDGER);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const nextDeals = await listDeals();
      setDeals(Array.isArray(nextDeals) ? nextDeals : FALLBACK_LEDGER);
      setError("");
    } catch (e) {
      setDeals(FALLBACK_LEDGER);
      setError(e instanceof Error ? e.message : "Finance ledger is temporarily unavailable.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const ledger = Array.isArray(deals) ? deals : FALLBACK_LEDGER;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Payments & Revenue</h1>
        <p className="text-slate-500">Deal value, payment state and configured revenue split.</p>
      </div>
      {ledger.map((d) => (
        <div key={d.id} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
          <b>₹{Number(d.price).toLocaleString("en-IN")}</b>
          <span>{d.payment_status}</span>
          <span>Creator split {d.revenue_split}%</span>
          <span>{d.contract_status}</span>
        </div>
      ))}
      {!ledger.length && !error && <p className="rounded-xl bg-white p-5 text-slate-500">No payable deals yet.</p>}
      {!ledger.length && error && <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500">Finance ledger is refreshing. The workspace remains available.</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
