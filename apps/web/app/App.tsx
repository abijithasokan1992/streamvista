import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

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
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#050607] text-zinc-400 grid place-items-center">Checking your session…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Layout>{children}</Layout>;
}

function AuthRedirect() {
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
      if (mounted) setSession(nextSession);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return <Navigate to={session ? '/creator-studio' : '/'} replace />;
}

function Home() {
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
        <Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
        <Route path="/film-os" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />
        <Route path="/film-os/:id" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />
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

function PublicHome() {
  return (
    <div className="min-h-screen bg-[#050607] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#050607]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="/" className="text-sm font-semibold tracking-[0.3em]">STREAMVISTA</a>
          <nav className="flex items-center gap-3">
            <a href="/pricing" className="px-3 py-2 text-sm text-white/60">Plans</a>
            <a href="/login" className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/80">Sign in</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/35">STREAMVISTA</p>
        <h1 className="mt-5 max-w-5xl text-5xl font-medium tracking-[-0.045em] md:text-7xl">The Operating System for Visual Content — From Idea to Release.</h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/45">Create projects. Protect rights. Connect with buyers. Deliver content seamlessly.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Start Creating</a>
          <a href="/crayons-bridge" className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/75">Open Bridge</a>
        </div>
      </main>
    </div>
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

export default App;
