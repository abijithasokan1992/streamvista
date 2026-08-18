import { useEffect, useState } from "react";
import { listDeals, updateDeal, type Deal } from "../services/marketplace";

const FALLBACK_LEDGER: Deal[] = [];

export default function Legal() {
  const [deals, setDeals] = useState<Deal[]>(FALLBACK_LEDGER);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const nextDeals = await listDeals();
      setDeals(Array.isArray(nextDeals) ? nextDeals : FALLBACK_LEDGER);
      setError("");
    } catch (e) {
      setDeals(FALLBACK_LEDGER);
      setError(e instanceof Error ? e.message : "Legal ledger is temporarily unavailable.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const ledger = Array.isArray(deals) ? deals : FALLBACK_LEDGER;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Legal</h1>
        <p className="text-slate-500">Licensing deals and contract status.</p>
      </div>
      {ledger.map((d) => (
        <div key={d.id} className="rounded-xl border bg-white p-4">
          <b>Deal {d.id.slice(0, 8)}</b>
          <p className="text-sm text-slate-500">
            Contract: {d.contract_status} · ₹{Number(d.price).toLocaleString("en-IN")}
          </p>
          {d.contract_status !== "approved" && (
            <button
              onClick={() => void updateDeal(d.id, { contract_status: "approved", status: "contract_ready" }).then(refresh)}
              className="mt-3 rounded-lg bg-black px-3 py-2 text-sm font-bold text-white"
            >
              Update contract status
            </button>
          )}
        </div>
      ))}
      {error && <p className="text-red-600">{error}</p>}
      {!ledger.length && !error && <p className="rounded-xl bg-white p-5 text-slate-500">No licensing deals yet.</p>}
      {!ledger.length && error && <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500">Legal ledger is refreshing. The workspace remains available.</p>}
    </div>
  );
}
