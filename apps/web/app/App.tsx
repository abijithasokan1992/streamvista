import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import CreatorStudio from './pages/CreatorStudio';
import FilmOS from './pages/FilmOS';
import Profile from './pages/Profile';
import CrayonsBridge from './pages/CrayonsBridge';
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

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#050607] text-zinc-400 grid place-items-center">Checking your session…</div>;
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

const systems = [
  { step: '01', label: 'CREATE', title: 'Make your project', text: 'Plan, store and manage your film, video or creator work in one place.', href: '/film-os' },
  { step: '02', label: 'PROTECT', title: 'Protect your work', text: 'Keep ownership, rights, approvals and important project records together.', href: '/rights' },
  { step: '03', label: 'CONNECT', title: 'Find the right buyer', text: 'Prepare your title, discover buyers and move approved opportunities into a deal.', href: '/buyers' },
  { step: '04', label: 'DISTRIBUTE', title: 'Deliver everywhere', text: 'Move finished content through QC, delivery and distribution workflows.', href: '/delivery' },
];

function Home() {
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  useEffect(() => { const onMove = (event: MouseEvent) => setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 }); window.addEventListener('mousemove', onMove, { passive: true }); return () => window.removeEventListener('mousemove', onMove); }, []);
  return (
    <main className="min-h-screen bg-[#050607] text-white selection:bg-white selection:text-black" style={{ backgroundImage: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,.055), transparent 24%), radial-gradient(circle at 50% 18%, rgba(108,132,155,.055), transparent 36%)` }}>
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#050607]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link to="/" className="text-sm font-semibold tracking-[0.3em] text-white">STREAMVISTA</Link><nav className="flex items-center gap-2 sm:gap-3"><Link to="/pricing" className="rounded-full px-3 py-2 text-sm text-white/55 transition hover:text-white">Plans</Link><Link to="/login" className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]">Sign in</Link></nav></div></header>
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28"><div className="max-w-4xl"><div className="mb-7 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/45">For filmmakers, creators and visual teams</div><h1 className="text-5xl font-medium tracking-[-0.045em] md:text-7xl lg:text-8xl">Your visual work, from idea to release.</h1><p className="mt-7 max-w-2xl text-base leading-7 text-white/48 md:text-lg">Create projects. Protect ownership. Find buyers. Deliver finished content.</p><div className="mt-9 flex flex-wrap gap-3"><Link to="/film-os" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]">Start creating</Link><a href="#ecosystem" className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.06]">See how it works</a></div></div></section>
      <section id="ecosystem" className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"><div className="mb-10 max-w-2xl"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">ONE WORKFLOW</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">One Film OS. Every department.</h2><p className="mt-4 text-base leading-7 text-white/42">Your production context stays connected from the first idea to the approved master.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{systems.map((system) => <Link key={system.label} to={system.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"><div className="flex items-center justify-between"><span className="text-xs text-white/28">{system.step}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] tracking-[0.16em] text-white/35">{system.label}</span></div><h3 className="mt-10 text-2xl font-medium tracking-tight">{system.title}</h3><p className="mt-3 text-sm leading-6 text-white/42">{system.text}</p><span className="mt-8 inline-flex text-xs font-medium text-white/35 transition group-hover:text-white/80">Open →</span></Link>)}</div></section>
      <section className="border-y border-white/[0.07] bg-white/[0.015]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div><p className="text-xs font-semibold tracking-[0.24em] text-white/30">CRAYONS BRIDGE</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">Turn finished content into business.</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/42">Prepare rights and metadata, find matching buyers, manage deals and move approved content toward payment and delivery.</p><Link to="/crayons-bridge" className="mt-7 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.05]">Open Bridge</Link></div><div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:p-7"><div className="grid gap-2 sm:grid-cols-2">{['Rights', 'Metadata', 'Buyer match', 'Deal', 'Payment', 'Delivery'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4"><span className="text-[10px] text-white/25">0{index + 1}</span><span className="text-sm text-white/60">{item}</span></div>)}</div></div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="max-w-3xl"><p className="text-xs font-semibold tracking-[0.24em] text-white/30">REAL INFRASTRUCTURE</p><h2 className="mt-4 text-3xl font-medium tracking-tight md:text-5xl">Built for real work.</h2><p className="mt-5 text-base leading-7 text-white/42">Secure sign-in, permissions, project data, AI provenance, rights, approvals, payments, QC and delivery — designed to work together.</p></div></section>
      <footer className="border-t border-white/[0.07]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 md:px-8 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-semibold tracking-[0.3em]">STREAMVISTA</div><div className="mt-2 text-sm text-white/30">The operating system for AI-assisted film production.</div></div><Link to="/film-os" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Open Film OS →</Link></div></footer>
    </main>
  );
}

const WorkspacePlaceholder = ({ name }: { name: string }) => <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-8"><div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-xl p-10 max-w-lg w-full text-center"><h2 className="text-3xl font-serif text-white mb-4">Welcome to <span className="text-cyan-400">{name}</span></h2><p className="text-zinc-400">Your secure workspace session is active.</p></div></div>;

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<SignUp />} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} /><Route path="/pricing" element={<Pricing />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /><Route path="/dashboard" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} /><Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
    <Route path="/film-os" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} /><Route path="/film-os/:id" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />
    <Route path="/crayons-pictures" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Pictures" /></ProtectedRoute>} /><Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} /><Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} /><Route path="/crayons-loop" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} />
    <Route path="/enterprise" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Enterprise" /></ProtectedRoute>} /><Route path="/crayons-vault" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Vault" /></ProtectedRoute>} /><Route path="/admin/noc" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} />
    {departments.map(([key]) => <Route key={key} path={`/${key}`} element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
