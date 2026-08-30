import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ImmersiveHome from './components/ImmersiveHome';
import './immersive-home.css';
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
    return <div className="min-h-screen bg-[#020617] text-zinc-400 grid place-items-center">Loading secure session…</div>;
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
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
        <Route path="/" element={<ImmersiveHome />} />
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
        <Route path="/crayons-vault" element={<ProtectedRoute><WorkspacePlaceholder name="Crayons Vault" /></ProtectedRoute>} />
        <Route path="/admin/noc" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
