import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import CreatorStudio from './pages/CreatorStudio';
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
    return <div className="min-h-screen bg-[#030405] text-zinc-400 grid place-items-center">Loading secure session…</div>;
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

const systems = [
  { label: 'CREATE', text: 'Creators · Cameras · Production · Cloud', href: '/creator-studio' },
  { label: 'PROTECT', text: 'Rights · Ownership · Chain of Title · Verification', href: '/crayons-bridge' },
  { label: 'CONNECT', text: 'Creators · Buyers · Deal Flow · Commerce', href: '/crayons-bridge' },
  { label: 'DISTRIBUTE', text: 'Master · QC · HLS · FAST · OTT · Global', href: '/crayons-loop' },
];

function BridgeHome() {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#030405] text-white selection:bg-white selection:text-black"
      style={{ backgroundImage: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,.08), transparent 24%), radial-gradient(circle at 50% 35%, rgba(120,150,180,.06), transparent 36%)` }}
    >
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="text-sm font-semibold tracking-[0.42em] text-white/90">STREAMVISTA</Link>
        <div className="flex items-center gap-5 text-xs uppercase tracking-[0.2em] text-white/55">
          <Link to="/pricing" className="transition hover:text-white">Plans</Link>
          <Link to="/login" className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-white/80 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.08]">Sign in</Link>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center justify-center px-6 pb-24 pt-28">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(circle at center, black, transparent 68%)' }} />
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center text-center">
          <div className="relative mb-10 h-[min(62vw,520px)] w-[min(62vw,520px)] max-w-[520px] min-w-[290px]">
            <div className="absolute inset-[12%] rounded-full border border-white/10 bg-white/[0.025] shadow-[0_0_120px_rgba(255,255,255,.07)] backdrop-blur-3xl" />
            <div className="absolute inset-[22%] rounded-full border border-white/15 bg-gradient-to-br from-white/[0.12] via-white/[0.015] to-transparent shadow-[inset_0_0_60px_rgba(255,255,255,.06)]" />
            <div className="absolute inset-[32%] rounded-full border border-white/20 bg-black/40 shadow-[0_0_80px_rgba(150,180,210,.12)]" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_30px_10px_rgba(255,255,255,.45)]" />
            {[0, 45, 90, 135].map((rotation) => (
              <span key={rotation} className="absolute left-1/2 top-1/2 h-px w-[58%] origin-left bg-gradient-to-r from-white/40 to-transparent" style={{ transform: `rotate(${rotation}deg)` }} />
            ))}
            <span className="absolute inset-[7%] rounded-full border border-dashed border-white/10" />
            <span className="absolute inset-[16%] rounded-full border border-dashed border-white/10" />
            <span className="absolute inset-[28%] rounded-full border border-dashed border-white/10" />
            <div className="absolute left-[8%] top-[28%] rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.22em] text-white/45 backdrop-blur-xl">Rights</div>
            <div className="absolute right-[5%] top-[45%] rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.22em] text-white/45 backdrop-blur-xl">AI / QC</div>
            <div className="absolute bottom-[18%] left-[15%] rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.22em] text-white/45 backdrop-blur-xl">Cloud</div>
            <div className="absolute bottom-[14%] right-[13%] rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.22em] text-white/45 backdrop-blur-xl">Commerce</div>
          </div>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.48em] text-white/45">The infrastructure behind visual content</p>
          <h1 className="max-w-5xl text-5xl font-medium tracking-[-0.045em] text-white md:text-7xl lg:text-8xl">The Operating System for Visual Content.</h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 md:text-lg">Create. Protect. Connect. Distribute.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">ENTER STREAMVISTA</Link>
            <a href="#ecosystem" className="rounded-full border border-white/15 bg-white/[0.03] px-7 py-3 text-sm font-semibold text-white/75 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.07]">EXPLORE THE ECOSYSTEM →</a>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="relative mx-auto max-w-7xl px-6 py-28 md:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/35">CONTENT UNIVERSE</p>
          <h2 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">One system. Every stage.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {systems.map((system, index) => (
            <Link key={system.label} to={system.href} className="group relative min-h-56 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full border border-white/10 transition duration-700 group-hover:scale-125" />
              <span className="text-[10px] tracking-[0.35em] text-white/35">0{index + 1}</span>
              <h3 className="mt-12 text-2xl font-medium tracking-tight">{system.label}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">{system.text}</p>
              <span className="absolute bottom-7 right-7 text-xs text-white/30 transition group-hover:text-white/80">OPEN →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.015] px-6 py-32 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/35">CRAYONS BRIDGE</p>
            <h2 className="mt-5 text-4xl font-medium tracking-tight md:text-6xl">Where content becomes commerce.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/45">Rights, metadata, buyer discovery, deal flow, licensing and payment — connected as one commercial path.</p>
            <Link to="/crayons-bridge" className="mt-8 inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/[0.06]">ENTER BRIDGE →</Link>
          </div>
          <div className="relative rounded-3xl border border-white/10 bg-black/30 p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
              {['Rights Verification', 'Metadata', 'Screener', 'Buyer Discovery', 'Deal Room', 'License', 'Payment', 'Distribution'].map((step, i) => (
                <React.Fragment key={step}>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">{step}</span>
                  {i < 7 && <span className="text-white/20">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 text-center md:px-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/35">REAL INFRASTRUCTURE</p>
        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-medium tracking-tight md:text-6xl">Built for real business.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45">Identity · RBAC · RLS · Rights · Audit · Payments · Data</p>
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {['IDENTITY', 'RIGHTS', 'DELIVERY', 'REVENUE'].map((item) => <div key={item} className="bg-[#050607] px-5 py-7 text-[10px] tracking-[0.3em] text-white/45">{item}</div>)}
        </div>
      </section>

      <footer className="border-t border-white/[0.07] px-6 py-16 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="text-sm font-semibold tracking-[0.35em]">STREAMVISTA</div><div className="mt-2 text-xs text-white/30">Create. Protect. Connect. Distribute.</div></div>
          <Link to="/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">ENTER STREAMVISTA →</Link>
        </div>
      </footer>
    </main>
  );
}

const WorkspacePlaceholder = ({ name }: { name: string }) => (
  <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center p-8">
    <div className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-xl p-10 max-w-lg w-full text-center">
      <h2 className="text-3xl font-serif text-white mb-4">Welcome to <span className="text-cyan-400">{name}</span></h2>
      <p className="text-zinc-400">Your secure workspace session is active.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BridgeHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
        <Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
        <Route path="/crayons-pictures" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Pictures" /></ProtectedRoute>} />
        <Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
        <Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} />
        <Route path="/crayons-loop" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} />
        <Route path="/enterprise" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Enterprise" /></ProtectedRoute>} />
        <Route path="/crayons-vault" element={<ProtectedRoute><WorkspacePlaceholder name="StreamVista Vault" /></ProtectedRoute>} />
        <Route path="/admin/noc" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
