import React from 'react';
import { Link } from 'react-router-dom';

const lanes = [
  { label: 'CREATE', title: 'Projects', meta: 'Film · Series · Visual', href: '/film-os', tone: 'live' },
  { label: 'PROTECT', title: 'Rights', meta: 'Ownership · Evidence · Access', href: '/crayons-bridge', tone: 'live' },
  { label: 'VERIFY', title: 'Readiness', meta: 'QC · Metadata · Clearances', href: '/ott-ready', tone: 'live' },
  { label: 'COMMERCIAL', title: 'Bridge', meta: 'Match · License · Deliver', href: '/crayons-bridge', tone: 'concept' },
];

const nav = [
  ['Home', '/'], ['Create', '/film-os'], ['Projects', '/creator-studio'], ['Rights', '/crayons-bridge'], ['Verify', '/ott-ready'], ['Bridge', '/crayons-bridge'], ['Pay', '/pay/upi'],
] as const;

export default function HomeOS() {
  return (
    <main className="min-h-screen bg-[#050607] text-white selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#050607]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-5 px-4 py-3 md:px-6">
          <Link to="/" className="shrink-0 text-sm font-semibold tracking-[0.32em]">STREAMVISTA</Link>
          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">{nav.map(([label, href]) => <Link key={label} to={href} className={`rounded-lg px-3 py-2 text-xs font-medium ${label === 'Home' ? 'bg-white text-black' : 'text-white/45 hover:bg-white/[0.05] hover:text-white'}`}>{label}</Link>)}</nav>
          <div className="ml-auto flex items-center gap-2"><button className="hidden rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40 sm:block">⌘K Command</button><Link to="/login" className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/75">Sign in</Link></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[76px_1fr]">
        <aside className="hidden border-r border-white/[0.06] py-6 lg:block"><div className="flex flex-col items-center gap-5 text-[10px] tracking-[0.14em] text-white/25">{['⌂','＋','◫','◇','✓','⇄','↗'].map((icon,i)=><span key={i} className={i===0?'text-white':''}>{icon}</span>)}</div></aside>
        <section className="min-w-0">
          <div className="border-b border-white/[0.06] px-5 py-8 md:px-8 lg:px-12 lg:py-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between"><div className="max-w-4xl"><div className="mb-4 flex items-center gap-3 text-[10px] font-semibold tracking-[0.24em] text-white/30"><span>STREAMVISTA OS</span><span className="h-px w-8 bg-white/10"/><span>HOME</span></div><h1 className="max-w-4xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] md:text-6xl lg:text-7xl">The Operating System for Visual Content.</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-white/42 md:text-base">From idea to release, keep your creative work, rights, readiness and commercial workflow connected in one operating environment.</p></div><div className="flex shrink-0 gap-2"><Link to="/film-os" className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black">+ New Project</Link><Link to="/creator-studio" className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70">Open Studio</Link></div></div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/35">{['CREATE','PROTECT','VERIFY','MATCH','LICENSE','DELIVER','MONETIZE'].map((s,i)=><React.Fragment key={s}>{i>0&&<span className="text-white/15">→</span>}<span>{s}</span></React.Fragment>)}</div>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-8 lg:p-12 xl:grid-cols-4">{lanes.map(lane=><Link key={lane.label} to={lane.href} className="group min-h-[190px] rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.045]"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.2em] text-white/25">{lane.label}</span><span className={`rounded-full border px-2 py-1 text-[9px] tracking-[0.15em] ${lane.tone==='live'?'border-white/10 text-white/35':'border-amber-300/15 text-amber-200/45'}`}>{lane.tone==='live'?'LIVE':'CONCEPT'}</span></div><div className="mt-12 text-2xl font-medium tracking-tight">{lane.title}</div><div className="mt-2 text-xs text-white/30">{lane.meta}</div><div className="mt-8 text-xs text-white/25 transition group-hover:text-white/70">Open workspace →</div></Link>)}</div>
          <div className="grid gap-4 px-5 pb-12 md:px-8 lg:grid-cols-[1.45fr_0.55fr] lg:px-12"><div className="rounded-2xl border border-white/10 bg-[#090b0e] p-6 md:p-7"><div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><div><div className="text-[10px] tracking-[0.2em] text-white/25">WORKSPACE</div><div className="mt-1 text-lg font-medium">Your operating surface</div></div><div className="text-[10px] text-white/20">NO MOCK METRICS</div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Link to="/creator-studio" className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]"><div className="text-xs text-white/30">PROJECTS</div><div className="mt-3 text-sm font-medium">Creator Studio</div><div className="mt-1 text-xs text-white/25">Open real workspace</div></Link><Link to="/ott-ready" className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]"><div className="text-xs text-white/30">READINESS</div><div className="mt-3 text-sm font-medium">OTT-Ready</div><div className="mt-1 text-xs text-white/25">Prepare a buyer-ready asset</div></Link><Link to="/crayons-bridge" className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/[0.03]"><div className="text-xs text-white/30">RIGHTS</div><div className="mt-3 text-sm font-medium">Crayons Bridge</div><div className="mt-1 text-xs text-white/25">Open commercial workspace</div></Link></div></div><div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7"><div className="text-[10px] tracking-[0.2em] text-white/25">SYSTEM STATE</div><div className="mt-5 space-y-3 text-xs"><div className="flex items-center justify-between"><span className="text-white/40">Product shell</span><span className="text-white/70">ACTIVE</span></div><div className="flex items-center justify-between"><span className="text-white/40">Creative workspace</span><span className="text-white/70">LIVE</span></div><div className="flex items-center justify-between"><span className="text-white/40">Commercial layer</span><span className="text-amber-200/60">CONCEPT</span></div></div><div className="mt-7 border-t border-white/[0.07] pt-5 text-[11px] leading-5 text-white/25">LIVE = verified functionality. CONCEPT = visible product direction, not a claimed live capability.</div></div></div>
        </section>
      </div>
    </main>
  );
}
