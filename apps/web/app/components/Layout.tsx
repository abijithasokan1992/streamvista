import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">Crayons Bridge</div>
            <p>Rights &amp; Content Marketplace</p>
            <span>Rights · QC · Buyer access · Licensing · Secure delivery</span>
          </div>
          <div className="footer-links">
            <Link to="/crayons-bridge">Bridge</Link>
            <Link to="/profile">Account</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Part of StreamVista OPC Pvt Ltd</span>
          <span>© 2026</span>
        </div>
      </footer>

      <style>{`
        .app-layout { min-height: 100vh; display: flex; flex-direction: column; background: var(--studio-black); }
        .main-content { flex: 1; margin-top: 68px; padding: 28px 4%; }
        .footer { background: var(--obsidian); border-top: 1px solid rgba(255,255,255,0.07); padding: 34px 4% 20px; margin-top: 42px; }
        .footer-content { width: min(94%, 1320px); margin: 0 auto; display: flex; align-items: flex-start; justify-content: space-between; gap: 32px; }
        .footer-logo { color: var(--studio-silver); font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; }
        .footer-brand p { margin: 7px 0 4px; color: var(--studio-silver); font-size: 0.8rem; }
        .footer-brand span { color: var(--studio-silver-muted); font-size: 0.7rem; }
        .footer-links { display: flex; flex-wrap: wrap; gap: 18px; }
        .footer-links a { color: var(--studio-silver-muted); font-size: 0.76rem; text-decoration: none; }
        .footer-links a:hover { color: var(--studio-silver); }
        .footer-bottom { width: min(94%, 1320px); margin: 24px auto 0; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; color: var(--studio-silver-muted); font-size: 0.68rem; }
        @media (max-width: 700px) { .main-content { padding: 22px 5%; } .footer-content { flex-direction: column; } .footer-bottom { width: 100%; } }
      `}</style>
    </div>
  );
};

export default Layout;
