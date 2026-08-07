import { ArrowLeft, ArrowRight, Film, Radio, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PublicPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryPath?: string;
};

export default function PublicPage({ eyebrow, title, description, primaryLabel = "Open StreamVista", primaryPath = "/" }: PublicPageProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-black text-black">SV</div><span className="font-bold">StreamVista</span></button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15} /> Home</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-300"><Sparkles size={14} /> {eyebrow}</div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">{description}</p>
          <button onClick={() => navigate(primaryPath)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-black hover:bg-amber-300">{primaryLabel}<ArrowRight size={16} /></button>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[{ icon: Film, title: "Content", text: "Creator, buyer and distributor workflows share one rights-first operating model." }, { icon: Radio, title: "Distribution", text: "FAST, licensing and delivery workflows remain separated from private operations." }, { icon: Sparkles, title: "AI Operations", text: "Private AI Workspace handles agents, platform health, incidents and recovery." }].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><item.icon size={19} className="text-amber-300" /><div className="mt-4 font-bold">{item.title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></div>
          ))}
        </div>
      </main>
    </div>
  );
}
