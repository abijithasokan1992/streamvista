import { ArrowRight, Check, Cloud, HardDrive, ShieldCheck, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  { name: "Starter", storage: "100 GB", price: "₹199 / month", note: "For creators and individuals" },
  { name: "Creator", storage: "1 TB", price: "₹799 / month", note: "For active media creators" },
  { name: "Studio", storage: "5 TB", price: "₹2,999 / month", note: "For teams and production houses" },
];

export default function CloudStorage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="text-sm font-black tracking-tight">StreamVista</Link>
          <Link to="/login?next=/cloud-storage" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">Sign in</Link>
        </header>

        <section className="grid gap-10 py-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200"><Cloud size={15} /> Cloud Storage</div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Store your media. Keep it ready.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Secure cloud storage for video, photos, documents and production files. Upload, organize, share and access your files from anywhere.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">Choose storage <ArrowRight size={17} /></a>
              <Link to="/login?next=/cloud-storage" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Open cloud</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><HardDrive size={21} /></span><div><p className="font-black">Your cloud</p><p className="text-xs text-slate-400">Media storage workspace</p></div></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">Ready</span></div>
            <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[18%] rounded-full bg-violet-500" /></div>
            <div className="mt-3 flex justify-between text-xs text-slate-400"><span>180 GB used</span><span>1 TB plan</span></div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[{ icon: Upload, label: "Upload" }, { icon: Users, label: "Share" }, { icon: ShieldCheck, label: "Protected" }, { icon: HardDrive, label: "Folders" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4"><Icon size={18} className="text-violet-300" /><p className="mt-2 text-sm font-bold">{label}</p></div>)}
            </div>
          </div>
        </section>

        <section id="plans" className="pb-16">
          <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Simple paid storage</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Pick the space you need.</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => <article key={plan.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm font-bold text-slate-300">{plan.name}</p><p className="mt-3 text-3xl font-black">{plan.storage}</p><p className="mt-2 text-lg font-black text-violet-300">{plan.price}</p><p className="mt-2 text-sm text-slate-400">{plan.note}</p><ul className="mt-5 space-y-2 text-sm text-slate-300"><li className="flex gap-2"><Check size={16} className="mt-0.5 text-emerald-300" /> Upload and organize files</li><li className="flex gap-2"><Check size={16} className="mt-0.5 text-emerald-300" /> Secure sharing</li><li className="flex gap-2"><Check size={16} className="mt-0.5 text-emerald-300" /> Storage usage tracking</li></ul><Link to="/login?next=/cloud-storage" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">Get started</Link></article>)}
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-xs text-slate-500">Cloud Storage is a standalone StreamVista product. Other StreamVista products remain connected through the A2A network.</footer>
      </div>
    </main>
  );
}
