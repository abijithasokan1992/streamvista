import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PaymentCharts from "../components/analytics/PaymentCharts";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function Analytics() {
  const [stats, setStats] = useState({ titles: 0, drafts: 0, screenings: 0, views: 0 });

  useEffect(() => {
    (async () => {
      const { count: titles } = await supabase.from("films_film").select("id", { count: "exact", head: true }).eq("status", "published");
      const { count: drafts } = await supabase.from("films_film").select("id", { count: "exact", head: true }).eq("status", "draft");
      const { count: screenings } = await supabase.from("film_audit_logs").select("id", { count: "exact", head: true }).eq("status", "pending");
      const { data: viewsData } = await supabase.from("film_audit_logs").select("views");
      const views = viewsData?.reduce((sum, row: { views?: number }) => sum + (row.views || 0), 0) || 0;
      setStats({ titles: titles || 0, drafts: drafts || 0, screenings: screenings || 0, views });
    })();
  }, []);

  return (
    <div className="min-h-full bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/60">Command Center</p>
          <h1 className="mt-2 text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-white/45">Operational intelligence across the StreamVista workspace.</p>
        </header>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["Published titles", stats.titles], ["Active drafts", stats.drafts], ["Pending screenings", stats.screenings], ["Views", stats.views]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs text-white/40">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>
          ))}
        </div>
        <div className="mt-8"><PaymentCharts /></div>
      </div>
    </div>
  );
}
