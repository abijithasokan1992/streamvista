import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { startPlanCheckout, type PaidCycle } from '../lib/pay';

const PACKAGES: Array<{ cycle: PaidCycle; name: string; price: string; description: string; features: string[] }> = [
  { cycle: 'topup', name: 'OTT Readiness Audit', price: '₹7,500', description: 'Fast diagnostic for a completed or near-completed project.', features: ['Project intake', 'Rights/readiness checklist', 'Metadata review', 'QC/readiness assessment', 'Commercial gaps report'] },
  { cycle: 'creator', name: 'OTT Launch Package', price: '₹25,000', description: 'Buyer-ready commercial packaging for your film.', features: ['Everything in Audit', 'Buyer-ready project profile', 'Metadata package', 'Commercial positioning', 'Pitch material refinement', 'Buyer submission preparation'] },
];

export default function OTTRready() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaidCycle | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const start = async (cycle: PaidCycle) => {
    setMessage(null);
    if (!supabase) { setMessage('Payment and authentication are not configured.'); return; }
    const { data } = await supabase.auth.getSession();
    if (!data.session) { navigate('/login'); return; }
    setSelected(cycle);
    const result = await startPlanCheckout(cycle);
    setSelected(null);
    if (!result.ok) setMessage(result.error ?? 'Payment could not be started.');
    else { setMessage('Payment verified. Continue with your project intake.'); navigate('/creator-studio'); }
  };

  return <main className="min-h-screen bg-[#050607] text-white">
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.24em] text-white/35">STREAMVISTA · OTT READINESS</p>
        <h1 className="mt-5 text-5xl font-medium tracking-[-0.045em] md:text-7xl">Give us your film. We turn the existing project into a buyer-ready commercial package.</h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">Rights readiness, metadata, QC gaps, project positioning and buyer-facing preparation — organized into one practical commercial workflow.</p>
        <button onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })} className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Get My Film OTT-Ready <ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>

    <section className="border-y border-white/[0.07] bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Rights & ownership readiness', 'Metadata & QC preparation', 'Buyer-facing project profile', 'Commercial route assessment'].map((item, i) => <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-6"><span className="text-xs text-white/25">0{i + 1}</span><h2 className="mt-7 text-lg font-medium">{item}</h2><p className="mt-2 text-sm leading-6 text-white/40">Prepared from your existing project and supplied materials.</p></div>)}
        </div>
      </div>
    </section>

    <section id="packages" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">CHOOSE YOUR STARTING POINT</p><h2 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">One project. One commercial path.</h2></div>
      {message && <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">{message}</p>}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {PACKAGES.map((pkg) => <article key={pkg.name} className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8">
          <p className="text-xs tracking-[0.18em] text-white/30">{pkg.name.toUpperCase()}</p><div className="mt-4 text-4xl font-semibold">{pkg.price}</div><p className="mt-3 min-h-12 text-sm leading-6 text-white/45">{pkg.description}</p>
          <div className="mt-7 space-y-3">{pkg.features.map(f => <div key={f} className="flex gap-3 text-sm text-white/65"><Check className="mt-0.5 h-4 w-4 shrink-0" />{f}</div>)}</div>
          <button disabled={selected !== null} onClick={() => start(pkg.cycle)} className="mt-8 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{selected === pkg.cycle ? 'Opening Razorpay…' : 'Get My Film OTT-Ready'}</button>
        </article>)}
      </div>
      <p className="mt-8 text-xs leading-5 text-white/25">Payment is treated as successful only after the authoritative payment verification path confirms the transaction. Premium commercialization work is handled through the same intake and fulfillment workflow.</p>
    </section>
  </main>;
}
