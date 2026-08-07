import { Boxes, FileCheck2, Globe2, PackageCheck, RefreshCw, TrendingUp } from "lucide-react";

const cards = [
  { label: "Available Catalogues", value: "Ready", icon: Boxes, detail: "Browse approved catalogues and rights windows" },
  { label: "Territory Manager", value: "Open", icon: Globe2, detail: "Track territory and language availability" },
  { label: "Delivery Queue", value: "0 blocked", icon: PackageCheck, detail: "Monitor masters, subtitles and delivery status" },
  { label: "License Tracker", value: "Active", icon: FileCheck2, detail: "Follow licence, term, expiry and renewal state" },
];

export default function DistributorDashboard() {
  return (
    <div className="space-y-7 pb-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Distributor OS</div>
            <h1 className="mt-2 text-3xl font-black text-white lg:text-4xl">Catalogue, territory and delivery operations</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">One workspace for rights availability, delivery progress, licence tracking and revenue reconciliation.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-2 text-xs font-semibold text-emerald-300"><RefreshCw size={15} /> Operational view</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-amber-300"><item.icon size={19} /></div>
            <div className="mt-4 text-sm font-semibold text-white">{item.label}</div>
            <div className="mt-1 text-2xl font-black text-white">{item.value}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-lg font-bold text-white">Distributor workflow</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["Review available catalogues", "Confirm territory rights", "Track delivery package", "Monitor licence expiry", "Reconcile revenue", "Request renewal"].map((task, i) => (
              <div key={task} className="rounded-xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300"><span className="mr-2 text-xs font-black text-amber-300">{String(i + 1).padStart(2, "0")}</span>{task}</div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-2 text-lg font-bold text-white"><TrendingUp size={19} className="text-amber-300" /> Revenue</div>
          <p className="mt-3 text-sm leading-6 text-slate-500">Revenue values stay evidence-driven. Financial totals appear only when a verified source is connected.</p>
          <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-widest text-slate-600">Current source state</div>
            <div className="mt-2 text-xl font-bold text-white">Awaiting verified revenue feed</div>
          </div>
        </div>
      </section>
    </div>
  );
}
