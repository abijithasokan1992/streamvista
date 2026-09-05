import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">{children}</main>
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="footer-logo">STREAMVISTA</div>
          <p className="footer-tagline">Visual Content Operating System</p>
          <span className="footer-meta">Create · Protect · Verify · License · Deliver</span>
        </div>
        <div className="footer-links">
          <Link to="/dashboard">Workspace</Link>
          <Link to="/film-os">Projects</Link>
          <Link to="/crayons-bridge">Bridge</Link>
          <Link to="/revenue">Revenue</Link>
          <Link to="/profile">Account</Link>
        </div>
      </div>
      <div className="footer-bottom"><span>StreamVista OPC Pvt Ltd</span><span>© 2026</span></div>
      <style>{`
        .app-layout { min-height:100vh; display:flex; flex-direction:column; background:var(--sv-bg); }
        .main-content { flex:1; margin-top:68px; padding:28px 0 44px; }
        .footer { border-top:1px solid var(--sv-border); padding:30px 0 18px; background:#080a0b; }
        .footer-content,.footer-bottom { width:min(1240px,calc(100% - 40px)); margin:0 auto; }
        .footer-content { display:flex; justify-content:space-between; gap:32px; }
        .footer-logo { font-size:14px; font-weight:750; letter-spacing:.18em; }
        .footer-tagline { margin-top:7px; color:var(--sv-muted); font-size:12px; }
        .footer-meta { display:block; margin-top:6px; color:var(--sv-dim); font-size:11px; }
        .footer-links { display:flex; flex-wrap:wrap; gap:18px; align-content:flex-start; }
        .footer-links a { color:var(--sv-muted); font-size:12px; }
        .footer-links a:hover { color:var(--sv-text); }
        .footer-bottom { margin-top:22px; padding-top:14px; border-top:1px solid rgba(255,255,255,.05); display:flex; justify-content:space-between; color:var(--sv-dim); font-size:10px; }
        @media(max-width:700px){ .main-content{padding:20px 0 34px;} .footer-content{flex-direction:column;} .footer-links{gap:14px;} }
      `}</style>
    </footer>
  </div>
  );

export default Layout;
