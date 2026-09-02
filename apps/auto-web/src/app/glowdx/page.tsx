"use client";

import { useMemo, useState } from "react";
import { Camera, ChevronRight, CircleCheck, Droplets, HeartPulse, Sparkles, Star, SunMedium, ShoppingBag, MessageCircle, Globe2 } from "lucide-react";

const findings = [
  { label: "Acne", value: 78, note: "Active congestion detected", icon: Sparkles },
  { label: "Pigmentation", value: 64, note: "Uneven tone around cheeks", icon: SunMedium },
  { label: "Oil", value: 71, note: "T-zone appears balanced-to-oily", icon: Droplets },
  { label: "Texture", value: 59, note: "Mild visible roughness", icon: Star },
  { label: "Sensitivity", value: 42, note: "Low-to-moderate sensitivity", icon: HeartPulse },
];

const routine = [
  { step: "01", time: "AM · 30 sec", name: "Low-pH Cloud Cleanser", why: "Reset oil and residue without stripping the barrier.", ingredients: "Centella · Panthenol · Allantoin", result: "Calmer feel in 14 days" },
  { step: "02", time: "AM · 10 sec", name: "Hydra Rice Essence", why: "Layer hydration so skin looks bouncy, not greasy.", ingredients: "Rice extract · Beta-glucan · Glycerin", result: "Smoother glow in 14–30 days" },
  { step: "03", time: "AM · 10 sec", name: "TXA Glow Serum", why: "Target uneven tone and post-breakout marks.", ingredients: "Tranexamic acid · Niacinamide · Licorice", result: "More even tone in 30 days" },
  { step: "04", time: "AM · 10 sec", name: "Barrier Cloud Cream", why: "Seal hydration and support a resilient barrier.", ingredients: "Ceramides · Squalane · Betaine", result: "Comfort + softness in 14 days" },
];

export default function GlowDxIndiaPage() {
  const [market, setMarket] = useState<"INR" | "AED">("INR");
  const [scanned, setScanned] = useState(false);
  const score = useMemo(() => Math.round(findings.reduce((s, f) => s + f.value, 0) / findings.length), []);

  return (
    <main className="min-h-screen bg-[#fbf8f7] text-[#332d2d]">
      <header className="sticky top-0 z-30 border-b border-[#e9dedb]/70 bg-[#fbf8f7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9d817a]">GlowDx</p>
            <h1 className="text-lg font-semibold tracking-[-0.03em]">India</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#e6d9d5] bg-white/75 p-1 text-xs">
            <Globe2 className="ml-2 h-3.5 w-3.5 text-[#9d817a]" />
            {(["INR", "AED"] as const).map((m) => (
              <button key={m} onClick={() => setMarket(m)} className={`rounded-full px-3 py-1.5 ${market === m ? "bg-[#332d2d] text-white" : "text-[#806b66]"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1.1fr_.9fr] md:px-6 md:py-10">
        <div className="relative overflow-hidden rounded-[34px] border border-[#eadfdb] bg-gradient-to-br from-[#f5e8e4] via-[#fbf6f2] to-[#e8eee7] p-6 md:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/45 blur-3xl" />
          <div className="relative max-w-xl">
            <span className="inline-flex rounded-full border border-white/80 bg-white/65 px-3 py-1 text-[11px] font-medium text-[#846e68]">AI skin intelligence · 60 sec</span>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] md:text-6xl">Your glow,<br />mapped to you.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#715f5a] md:text-base">Selfie → skin signals → a simple K-beauty routine built around barrier care, visible results and transparent ingredients.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setScanned(true)} className="inline-flex items-center gap-2 rounded-full bg-[#332d2d] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#332d2d]/15"><Camera className="h-4 w-4" /> Start skin scan <ChevronRight className="h-4 w-4" /></button>
              <a href="#routine" className="rounded-full border border-[#d8c9c5] bg-white/65 px-5 py-3 text-sm font-medium text-[#514441]">See routine</a>
            </div>
            <div className="mt-7 flex items-center gap-4 text-xs text-[#7c6863]"><CircleCheck className="h-4 w-4" /> Ingredient-reviewed catalog <span>•</span> No diagnosis claims</div>
          </div>
        </div>

        <div className="rounded-[34px] border border-[#eadfdb] bg-white/75 p-5 shadow-[0_20px_60px_rgba(93,70,63,0.08)] backdrop-blur-xl md:p-6">
          <div className="aspect-[4/3] rounded-[28px] bg-[radial-gradient(circle_at_50%_38%,#f7ddd4,transparent_28%),linear-gradient(145deg,#eee9e4,#e7efe9)] relative flex items-center justify-center overflow-hidden">
            <div className="h-48 w-36 rounded-[48%] border-[3px] border-white/90 shadow-[0_0_0_999px_rgba(255,255,255,0.08)]" />
            <div className="absolute inset-x-10 top-1/2 h-px bg-white/65" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-medium text-[#76615b] backdrop-blur">Center face · natural light</div>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9d817a]">Skin signal</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{scanned ? score : "—"}<span className="text-base font-normal text-[#a28f8a]"> / 100</span></p>
            </div>
            <button onClick={() => setScanned(true)} className="rounded-full border border-[#dccdc9] px-3 py-2 text-xs font-medium">{scanned ? "Rescan" : "Use camera"}</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {findings.map(({ label, value, note, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-[#eadfdb] bg-white/70 p-4 backdrop-blur">
              <div className="flex items-center justify-between"><span className="text-xs font-medium text-[#6d5a55]">{label}</span><Icon className="h-4 w-4 text-[#b08d85]" /></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eee4e1]"><div className="h-full rounded-full bg-[#a8847c]" style={{ width: `${value}%` }} /></div>
              <p className="mt-3 text-xl font-semibold">{scanned ? `${value}%` : "—"}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#8b7670]">{note}</p>
              {scanned && <p className="mt-2 text-[10px] font-medium text-[#7a625b]">AI confidence · {Math.max(72, value)}%</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="routine" className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9d817a]">Your 1-minute ritual</p><h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">K-beauty, without the guesswork.</h3></div>
          <div className="rounded-full border border-[#e4d6d2] bg-white/70 px-4 py-2 text-xs text-[#76625d]">{routine.length} steps · morning routine</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {routine.map((item) => (
            <article key={item.step} className="rounded-[30px] border border-[#eadfdb] bg-white/78 p-5 shadow-[0_16px_40px_rgba(93,70,63,0.05)]">
              <div className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f3e7e2] text-xs font-semibold text-[#8f7169]">{item.step}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-lg font-semibold">{item.name}</h4><span className="rounded-full bg-[#f3f0eb] px-2 py-1 text-[10px] text-[#81716c]">{item.time}</span></div><p className="mt-2 text-sm leading-5 text-[#6e5c57]">{item.why}</p><p className="mt-3 text-xs text-[#977f78]">{item.ingredients}</p><div className="mt-4 flex items-center justify-between border-t border-[#eee5e2] pt-4"><span className="text-xs font-medium text-[#67534f]">{item.result}</span><button className="rounded-full border border-[#decfcb] px-3 py-1.5 text-xs">Why this?</button></div></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-6">
        <div className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[30px] border border-[#eadfdb] bg-[#f2e7e2] p-6 md:p-8"><p className="text-xs uppercase tracking-[0.22em] text-[#987b73]">GlowDx bundle</p><h4 className="mt-2 text-2xl font-semibold">The Calm + Glow Set</h4><p className="mt-2 max-w-xl text-sm leading-6 text-[#705d58]">Four steps, one box. Designed for the routine above, with auto-replenishment so the regimen stays consistent.</p><div className="mt-6 flex flex-wrap items-center gap-3"><button className="inline-flex items-center gap-2 rounded-full bg-[#332d2d] px-5 py-3 text-sm font-medium text-white"><ShoppingBag className="h-4 w-4" /> Add bundle · {market === "INR" ? "₹3,490" : "AED 154"}</button><span className="text-xs text-[#7c6761]">Subscribe & save 10%</span></div></div>
          <div className="rounded-[30px] border border-[#eadfdb] bg-white/75 p-6"><div className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-[#9b7b73]" /> WhatsApp adherence</div><p className="mt-3 text-sm leading-6 text-[#715e59]">Get gentle reminders, reorder nudges and a 30-day progress check-in.</p><button className="mt-5 w-full rounded-full border border-[#d9cac6] px-4 py-3 text-sm font-medium">Connect WhatsApp</button></div>
        </div>
      </section>

      <section className="border-t border-[#eadfdb] bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs uppercase tracking-[0.2em] text-[#9d817a]">Creator proof</p><h4 className="mt-1 text-2xl font-semibold">Loved in K-drama, made simple for India.</h4></div><p className="max-w-md text-sm text-[#75635e]">Partner UGC can appear here as short, authentic routine stories with ingredient and usage disclosures.</p></div><div className="mt-5 grid gap-4 md:grid-cols-3">{["01 / Night reset", "02 / Dewy morning", "03 / Barrier week"].map((t) => <div key={t} className="rounded-3xl border border-[#eadfdb] bg-[#f7f2ef] p-5"><div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-[#e5d9d1] to-[#e7eee9]" /><p className="mt-4 text-sm font-semibold">{t}</p><p className="mt-1 text-xs text-[#8d7771]">Partner creator · 20 sec UGC slot</p></div>)}</div></div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-[11px] leading-5 text-[#927e79] md:px-6">GlowDx India is a cosmetic discovery experience, not a medical diagnosis service. Skin-analysis outputs are informational and should not replace professional dermatology advice. Product catalog policies, ingredient certifications, commerce integrations and shipping availability should be verified before production launch.</footer>
    </main>
  );
}
