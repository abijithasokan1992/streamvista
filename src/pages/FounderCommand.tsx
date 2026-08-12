import { ArrowUpRight, CircleCheck, Clock3, IndianRupee, ShieldCheck, Sparkles } from "lucide-react";

const queues = [
  { priority: "P0", title: "Immediate close", detail: "Buyer-ready licensing opportunities", count: 4, tone: "bg-orange-500" },
  { priority: "P1", title: "Immediate money", detail: "Invoices, payment links and follow-ups", count: 7, tone: "bg-violet-600" },
  { priority: "P2", title: "High-value clients", detail: "Strategic buyer and studio expansion", count: 3, tone: "bg-black" },
];

export default function FounderCommand() {
  return <div className="space-y-8 text-slate-950">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="eyebrow">Founder command</p><h1 className="display-title mt-2">One desk. Every decision.</h1><p className="mt-3 max-w-2xl text-slate-600">Approvals, revenue and delivery signals collected into one verified operating view.</p></div>
      <button className="primary-action"><Sparkles size={16}/> Ask StreamVista AI</button>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <article className="metric-card"><span><IndianRupee size={18}/></span><p>Revenue queue</p><strong>11 actions</strong><small>Next action assigned</small></article>
      <article className="metric-card"><span><Clock3 size={18}/></span><p>Founder approvals</p><strong>3 ready</strong><small>Nothing executes before approval</small></article>
      <article className="metric-card"><span><ShieldCheck size={18}/></span><p>Release health</p><strong>Build green</strong><small>Runtime binding pending evidence</small></article>
    </div>
    <section className="surface-card p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Priority queue</p><h2 className="mt-1 text-2xl font-semibold">What needs attention now</h2></div><CircleCheck className="text-violet-600"/></div>
      <div className="mt-6 divide-y divide-slate-200">{queues.map(q=><div key={q.priority} className="flex items-center gap-4 py-5"><span className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white ${q.tone}`}>{q.priority}</span><div className="min-w-0 flex-1"><h3 className="font-semibold">{q.title}</h3><p className="text-sm text-slate-500">{q.detail}</p></div><b className="text-2xl">{q.count}</b><ArrowUpRight size={18}/></div>)}</div>
    </section>
  </div>;
}
