import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CrayonsBridge from './pages/CrayonsBridge';
import BridgeDashboard from './pages/BridgeDashboard';
import CreatorStudio from './pages/CreatorStudio';
import Watch from './pages/Watch';
import Profile from './pages/Profile';
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
    void supabase.auth.getSession().then(({ data }) => {
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

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white/50 grid place-items-center">Checking your Bridge session…</div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function BridgeHome() {
  return <main className="min-h-screen bg-[#05070a] text-white"><div className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-12 md:px-8"><div className="max-w-4xl"><div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">CRAYONS BRIDGE</div><h1 className="mt-4 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">B2B Content Licensing Infrastructure.</h1><p className="mt-6 max-w-3xl text-base leading-7 text-white/45 md:text-lg">Submit content. Verify rights. Discover approved titles. Screen securely. Negotiate licensing through a controlled Deal Room workflow.</p><div className="mt-8 flex flex-wrap gap-3"><a href="/login" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Enter Bridge</a><a href="/signup" className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/75">Create account</a></div></div></div></main>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<BridgeHome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/dashboard" element={<ProtectedRoute><BridgeDashboard /></ProtectedRoute>} />
    <Route path="/creator" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
    <Route path="/studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
    <Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
    <Route path="/catalog" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
    <Route path="/watch" element={<ProtectedRoute><Watch /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
