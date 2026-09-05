import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Pricing from './pages/Pricing';
import OTTRready from './pages/OTTRready';
import CreatorStudio from './pages/CreatorStudio';
import FilmOS from './pages/FilmOS';
import Profile from './pages/Profile';
import CrayonsBridge from './pages/CrayonsBridge';
import Watch from './pages/Watch';
import RevenueDashboard from './pages/RevenueDashboard';
import CrayonsLoop from './pages/CrayonsLoop';
import CrayonsLoopHome from './pages/CrayonsLoopHome';
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
  if (loading) return <div className="sv-shell" style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>Checking session…</div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Layout>{children}</Layout>;
}

const systems = [
  ['01','CREATE','Create a project','Film, series, campaign or visual project workspace.','/film-os'],
  ['02','PROTECT','Protect rights','Rights, approvals, ownership and project history in one record.','/crayons-bridge'],
  ['03','VERIFY','Verify + match','QC, metadata, buyer readiness and licensing workflow.','/crayons-bridge'],
  ['04','MONETIZE','Deliver + monetize','Secure delivery, deal records, payments and revenue tracking.','/revenue'],
];

function Home() {
  return <main className="sv-shell">
    <section className="sv-container" style={{padding:'92px 0 70px'}}>
      <div style={{maxWidth:920}}>
        <div className="sv-status"><span className="sv-status-dot" style={{color:'var(--sv-success)'}}/> Production OS</div>
        <div className="sv-eyebrow" style={{marginTop:24}}>STREAMVISTA</div>
        <h1 style={{fontSize:'clamp(48px,7vw,88px)',lineHeight:1.02,marginTop:12}}>The operating system for visual content.</h1>
        <p style={{color:'var(--sv-muted)',fontSize:'18px',lineHeight:1.7,maxWidth:720,marginTop:22}}>Create, protect, verify, match, license, deliver and monetize your content from one connected workspace.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:30}}>
          <Link className="sv-btn sv-btn-primary" to="/dashboard">Open workspace</Link>
          <Link className="sv-btn" to="/film-os">Create a project</Link>
          <Link className="sv-btn sv-btn-ghost" to="/pricing">View plans</Link>
        </div>
      </div>
    </section>
    <section className="sv-container" style={{padding:'10px 0 72px'}}>
      <div className="sv-eyebrow">ONE CONNECTED WORKFLOW</div>
      <div className="sv-grid" style={{gridTemplateColumns:'repeat(4,minmax(0,1fr))',marginTop:14}}>
        {systems.map(([step,label,title,text,href]) => <Link key={step} to={href} className="sv-card sv-card-pad" style={{minHeight:230}}>
          <div style={{display:'flex',justifyContent:'space-between',color:'var(--sv-dim)',fontSize:11}}><span>{step}</span><span>{label}</span></div>
          <h2 style={{fontSize:24,marginTop:46}}>{title}</h2><p className="sv-muted" style={{fontSize:13,lineHeight:1.65,marginTop:10}}>{text}</p>
          <span style={{display:'inline-block',marginTop:22,fontSize:12,fontWeight:700}}>Open →</span>
        </Link>)}
      </div>
    </section>
  </main>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} /><Route path="/signup" element={<SignUp />} />
    <Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/pricing" element={<Pricing />} /><Route path="/ott-ready" element={<OTTRready />} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
    <Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
    <Route path="/crayons-bridge" element={<ProtectedRoute><CrayonsBridge /></ProtectedRoute>} />
    <Route path="/film-os" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} /><Route path="/film-os/:id" element={<ProtectedRoute><FilmOS /></ProtectedRoute>} />
    <Route path="/watch" element={<ProtectedRoute><Watch /></ProtectedRoute>} /><Route path="/revenue" element={<ProtectedRoute><RevenueDashboard /></ProtectedRoute>} />
    <Route path="/admin/noc" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} />
    <Route path="/crayons-loop" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} /><Route path="/loop" element={<CrayonsLoopHome />} />
    <Route path="/loop/browse" element={<CrayonsLoopHome />} /><Route path="/loop/my-list" element={<ProtectedRoute><CrayonsLoop /></ProtectedRoute>} />
    <Route path="/loop/plans" element={<Pricing />} /><Route path="/loop/account" element={<ProtectedRoute><Profile /></ProtectedRoute>} /><Route path="/loop/admin" element={<ProtectedRoute><NOCDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><SpeedInsights /><Analytics /></BrowserRouter>;
}
