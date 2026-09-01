import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import CreatorStudio from './pages/CreatorStudio';
import FilmOS from './pages/FilmOS';
import Profile from './pages/Profile';
import CrayonsBridge from './pages/CrayonsBridge';
import Watch from './pages/Watch';
import RevenueDashboard from './pages/RevenueDashboard';
import CrayonsLoop from './pages/CrayonsLoop';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NOCDashboard from './admin/noc/page';
import Layout from './components/Layout';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) { setSession(data.session); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { if (mounted) setSession(nextSession); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  if (loading) return <div className="min-h-screen bg-[#050607] text-zinc-400 grid place-items-center">Checking your session…</div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Layout>{children}</Layout>;
}

const systems = [
  { step: '01', label: 'CREATE', title: 'Create your project', text: 'Plan, build and manage your film, video or visual project in one connected workspace.', href: '/film-os' },
  { step: '02', label: 'PROTECT', title: 'Protect your rights', text: 'Keep encrypted rights records, approvals, ownership evidence and project history connected.', href: '/crayons-bridge' },
  { step: '03', label: 'VERIFY · MATCH · LICENSE', title: 'Connect with verified buyers', text: 'Complete QC and rights verification, prepare professional metadata, match buyers and control licensing.', href: '/crayons-bridge' },
  { step: '04', label: 'DELIVER · MONETIZE', title: 'Deliver securely and monetize', text: 'Track chain of custody, control access, deliver approved assets and manage commercial outcomes.', href: '/crayons-loop' },
];

function Home() {
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  useEffect(() => { const onMove = (event: MouseEvent) => setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 }); window.addEventListener('mousemove', onMove, { passive: true }); return () => window.removeEventListener('mousemove', onMove); }, []);
  return <main className="min-h-screen bg-[#050607] text-white selection:bg-white selection:text-black" style={{ backgroundImage: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,.055), transparent 24%), radial-gradient(circle at 50% 18%, rgba(108,132,155,.055), transparent 36%)` }}>
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#050607]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link to="/" className="text-sm font-semibold tracking-[0.3em] text-white">STREAMVISTA</Link><nav className="flex items-center gap-2 sm:gap-3"><Link to="/watch" className="rounded-full px-3 py-2 text-sm text-white/55 transition hover:text-white">Watch</Link><Link to="/pricing" className="rounded-full px-3 py-2 text-sm text-white/55 transition hover:text-white">Plans</Link><Link to="/login" className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]">Sign in</Link></nav></div></header>
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28"><div className="max-w-5xl"><div className="mb-7 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/45">For filmmakers, creators, studios and visual teams</div><h1 className="text-5xl font-medium tracking-[-0.045em] md:text-7xl lg:text-8xl">The Operating System for Visual Content — From Idea to Release.</h1><p className="mt-7 max-w-3xl text-base leading-7 text-white/48 md:text-lg">Create projects. Protect rights. Connect with buyers. Deliver content seamlessly.</p><div className="mt-5 max-w-3xl text-sm leading-6 text-white/35 md:text-base">One connected ecosystem for creation, rights protection, verification, buyer matching, licensing, secure delivery and monetization.</div><div className="mt-9 flex flex-wrap gap-3"><Link to="/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]">Start Creating</Link><Link to="/crayons-bridge" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.06]">Open Bridge</Link><Link to="/watch" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.06]">Browse & License</Link><Link to="/pricing" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.06]">Explore Plans</Link></div></div></section>
    <section id="ecosystem" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"><div className="mb-10 max-w-3xl"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">ONE OPERATING WORKFLOW</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">Create → Protect → Verify → Match → License → Deliver → Monetize</h2><p className="mt-4 text-base leading-7 text-white/42">Your content, rights, commercial records and delivery workflow stay connected from the first idea to release.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{systems.map((system) => <Link key={system.label} to={system.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"><div className="flex items-center justify-between gap-3"><span className="text-xs text-white/28">{system.step}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] tracking-[0.16em] text-white/35">{system.label}</span></div><h3 className="mt-10 text-2xl font-medium tracking-tight">{system.title}</h3><p className="mt-3 text-sm leading-6 text-white/42">{system.text}</p><span className="mt-8 inline-flex text-xs font-medium text-white/35 transition group-hover:text-white/80">Open →</span></Link>)}</div></section>
    <section className="border-y border-white/[0.07] bg-white/[0.015]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><p className="text-xs font-semibold tracking-[0.24em] text-white/30">CRAYONS BRIDGE</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">Monetize finished content with complete control.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/42">Move from QC and rights verification to buyer matching, licensing, secure asset delivery and payment — with commercial control built into the workflow.</p><Link to="/crayons-bridge" className="mt-7 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.05]">Open Bridge</Link></div><div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:p-7"><div className="grid gap-2 sm:grid-cols-2">{['Encrypted rights records','Licensing & approvals','QC & clearance','Rights verification','Buyer verification & matching','Chain-of-custody tracking','Secure asset delivery','Controlled monetization'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4"><span className="text-[10px] text-white/25">{String(index + 1).padStart(2, '0')}</span><span className="text-sm text-white/60">{item}</span></div>)}</div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">RIGHTS INFRASTRUCTURE</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">From creation to a buyer-ready, release-ready asset.</h2><p className="mt-5 text-base leading-7 text-white/42">Standardize the commercial journey with professional metadata, rights verification, clearances, buyer access controls, licensing records and secure delivery.</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Secure','Protected assets and rights-controlled access'],['Verified','QC, clearance and rights evidence'],['Commercial','Buyer matching, licensing and approvals'],['Traceable','Chain-of-custody and delivery records']].map(([title, text]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-sm font-medium text-white/80">{title}</div><div className="mt-2 text-sm leading-6 text-white/38">{text}</div></div>)}</div></section>
    <section className="border-t border-white/[0.07] bg-white/[0.01]"><div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">THE STREAMVISTA PROMISE</p><p className="mt-5 max-w-4xl text-2xl leading-10 tracking-tight text-white/78 md:text-4xl md:leading-tight">StreamVista is the Operating System for Visual Content — helping creators create, protect rights, connect with buyers, license content, and deliver securely from idea to release.</p><p className="mt-5 max-w-4xl text-base leading-7 text-white/38 md:text-lg">Visual Content-ന്റെ Operating System; ആശയത്തിൽ നിന്ന് release വരെ creation, rights protection, buyer connection, licensing, secure delivery എന്നിവ ഒരൊറ്റ ecosystem-ൽ.</p></div></section>
    <footer className="border-t border-white/[0.07]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 md:px-8 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-semibold tracking-[0.3em]">STREAMVISTA</div><div className="mt-2 text-sm text-white/30">The Operating System for Visual Content.</div></div><Link to="/login" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Start Creating →</Link></div></footer>
  </main>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<SignUp />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/pricing" element={<Pricing />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /><Route path="/dashboard" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} /><Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} /><Route path="/film-os" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} /><Route path="/film-os/:id" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />
    <Route path="/crayons-pictures" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Pictures" /></ProtectedRoute>} /><Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} /><Route path="/watch" element={<ProtectedRoute><Watch /></ProtectedRoute>} /><Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} /><Route path="/crayons-loop" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} /><Route path="/enterprise" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Enterprise" /></ProtectedRoute>} /><Route path="/crayons-vault" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Vault" /></ProtectedRoute>} /><Route path="/admin/noc" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}

const WorkspacePlaceholder = ({ name }: { name: string }) => (
  <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-8">
    <div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-xl p-10 max-w-lg w-full text-center">
      <h2 className="text-3xl font-serif text-white mb-4">Welcome to <span className="text-cyan-400">{name}</span></h2>
      <p className="text-zinc-400">Your secure workspace session is active.</p>
    </div>
  </div>
);
