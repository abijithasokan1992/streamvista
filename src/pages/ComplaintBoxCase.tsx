import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, ShieldCheck, Sparkles } from "lucide-react";

const options = ["YES / VERIFIED", "PARTIAL / NEEDS WORK", "NO / MISSING", "N/A", "AI ASK FOUNDER"] as const;
const stages = ["Case classification", "Evidence", "Authority routing", "Legal-aware drafting", "Approval & transport", "Follow-up & escalation"];

export default function ComplaintBoxCase() {
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<string[]>([]);
  const key = `${stage}-main`;
  const current = answers[key];
  const questions = useMemo(() => [
    { q: "Is this a civil debt-recovery matter based on the supplied facts?", a: "YES / VERIFIED", note: "The supplied facts describe credit-card non-payment. This is not, by itself, proof of criminal breach of trust or cheating." },
    { q: "Is the outstanding amount independently verified with the provider?", a: "AI ASK FOUNDER", note: "Verify the outstanding directly with HDFC before treating the amount as established." },
    { q: "Is there evidence of dishonest intent at the time the card was obtained/used?", a: "AI ASK FOUNDER", note: "Subsequent inability to pay should not be converted into a criminal conclusion without evidence." },
    { q: "Is a verified authority route available for this case?", a: "AI ASK FOUNDER", note: "Complaint BOX must verify the applicable grievance route before automated outbound action." },
    { q: "Has the user approved any consequential outbound communication?", a: "NO / MISSING", note: "No message should be sent automatically from this evaluator without explicit configured approval." },
    { q: "Can the case remain open until payment, negotiated resolution, or route exhaustion?", a: "YES / VERIFIED", note: "The case model supports follow-up, escalation and user-confirmed resolution." },
  ], []);
  const item = questions[Math.min(stage, questions.length - 1)];

  const setAnswer = (value: string) => setAnswers((old) => ({ ...old, [key]: value }));
  const addEvidence = (label: string) => setEvidence((old) => old.includes(label) ? old : [...old, label]);

  return <main className="min-h-screen bg-slate-950 text-white"><header className="border-b border-white/10 bg-slate-950/90"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link to="/complaint-box" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Complaint BOX</Link><span className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Case Evaluator v2.0</span></div></header>
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-7 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-2">{stages.map((s, i) => <button key={s} onClick={() => setStage(i)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm ${i === stage ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/5"}`}><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-700 text-xs">{i + 1}</span>{s}</button>)}<div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4 text-xs leading-5 text-emerald-200"><ShieldCheck size={16} className="mb-2"/>Hard gate: no verified record → no automated outbound complaint.</div></aside>
      <section><div className="rounded-3xl border border-white/10 bg-white/[.045] p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Stage 0 • Real case</p><h1 className="mt-2 text-3xl font-black tracking-tight">Civil debt recovery evaluation</h1><p className="mt-2 text-sm text-slate-400">HDFC credit card • ₹1,99,834.92 • notice from Koncept Law Associates</p></div><Sparkles className="text-cyan-300"/></div>
        <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5"><div className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="text-emerald-300" size={17}/>AI extracted from case evidence</div><p className="mt-3 text-sm leading-6 text-slate-300">The evaluator treats the supplied classification as a civil debt-recovery case. It does not assert that any criminal offence occurred or did not occur; those conclusions require facts and appropriate professional review.</p></div>
        <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Founder question</p><h2 className="mt-2 text-xl font-bold">{item.q}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{item.note}</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{options.map((o) => <button key={o} onClick={() => setAnswer(o)} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${current === o ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-white/10 bg-white/[.025] text-slate-300 hover:border-white/25"}`}>{o}</button>)}</div></div>
        <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Evidence shortcuts</p><div className="mt-3 flex flex-wrap gap-2">{["Credit-card statement", "Legal notice", "Policy / terms", "Provider response", "User explanation"].map((x) => <button key={x} onClick={() => addEvidence(x)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${evidence.includes(x) ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-200" : "border-white/10 text-slate-400"}`}><FileText size={13} className="mr-1 inline"/>{x}</button>)}</div></div>
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5"><span className="text-xs text-slate-500">Evidence added: {evidence.length} • Answer: {current ?? "Not answered"}</span><button onClick={() => stage < stages.length - 1 ? setStage(stage + 1) : navigate("/complaint-box/dashboard")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">{stage < stages.length - 1 ? "Next question" : "Open case dashboard"}<ChevronRight size={16}/></button></div>
      </div></section>
    </div></main>;
}
