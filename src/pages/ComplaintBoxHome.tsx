import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Upload, Scale } from "lucide-react";

const caseFacts = [
  "Case type: Civil debt recovery",
  "Amount disputed: ₹1,99,834.92",
  "Provider: HDFC Bank / credit card",
  "Criminal allegation: not established from the facts supplied",
];

export default function ComplaintBoxHome() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/complaint-box" className="flex items-center gap-3 font-black tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#07111f]"><Scale size={19} /></span>
          COMPLAINT BOX
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login?next=/complaint-box/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold">Sign in</Link>
          <button onClick={() => navigate("/login?join=1&next=/complaint-box/dashboard")} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#07111f]">Create account</button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pt-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-300">One input. One case. Verified routing.</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[.94] tracking-[-.055em] sm:text-6xl lg:text-7xl">Turn a problem into a managed resolution case.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Tell Complaint BOX what happened. AI structures the facts, identifies the relevant route, prepares the complaint and keeps every response, follow-up and escalation in one case.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate("/complaint-box/case")} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-[#07111f]">Evaluate my case <ArrowRight size={18} /></button>
            <Link to="/complaint-box/dashboard" className="rounded-2xl border border-white/15 px-5 py-3 font-semibold">View dashboard</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {["AI-first case evaluation", "Verified authority routing", "User approval before consequential send", "Resolution timeline"].map((x) => <div key={x} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 size={17} className="text-cyan-300" />{x}</div>)}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[.055] p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between"><span className="text-sm font-bold">Real case evaluator</span><span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">AI REVIEW</span></div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-slate-200">Credit card non-payment notice</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">“Koncept Law Associates sent a notice regarding ₹1,99,834.92 outstanding.”</p>
            <div className="mt-5 space-y-2">
              {caseFacts.map((x) => <div key={x} className="rounded-xl bg-white/[.04] px-3 py-2 text-xs text-slate-300">{x}</div>)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-200">Civil matter</div><div className="rounded-xl bg-blue-400/10 p-3 text-blue-200">Verify bank</div><div className="rounded-xl bg-amber-400/10 p-3 text-amber-200">Negotiate / pay</div></div>
          <button onClick={() => navigate("/complaint-box/case")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#07111f]">Start with this case <ArrowRight size={16} /></button>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b1728] py-14"><div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-3 lg:px-10">
        {[{i:Upload,t:"Give evidence",d:"Photo, notice, PDF, email or your own explanation."},{i:ShieldCheck,t:"Verify before routing",d:"No verified authority record means no automated outbound complaint."},{i:FileText,t:"Keep the case",d:"Draft, approval, messages, follow-up and resolution stay together."}].map(({i:Icon,t,d}) => <div key={t} className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><Icon className="text-cyan-300"/><h3 className="mt-4 font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{d}</p></div>)}
      </div></section>
    </main>
  );
}
