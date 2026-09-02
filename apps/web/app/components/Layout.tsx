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
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">StreamVista</h2>
            <p>Strategic Data Partner for Pan-Indian AI & OTT.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Platform</h4>
              <Link to="/crayons-bridge">Crayons Bridge</Link>
              <Link to="/creator-studio">Creator Studio</Link>
              <Link to="/crayons-loop">Crayons Loop</Link>
              <Link to="/revenue">Revenue</Link>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <span className="coming-soon">Privacy Policy · Published page required</span>
              <span className="coming-soon">Rights & Licensing · Published page required</span>
              <span className="coming-soon">Terms of Use · Published page required</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Streamvista OPC Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--studio-black);
        }

        .main-content {
          flex: 1;
          margin-top: 80px;
          padding: 40px 5%;
        }

        .footer {
          background: var(--obsidian);
          border-top: 1px solid var(--glass-border);
          padding: 60px 5% 30px;
          margin-top: 80px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: 2fr 1fr;
          }
        }

        .footer-logo {
          font-family: var(--font-display);
          color: var(--royal-gold);
          margin-bottom: 16px;
        }

        .footer-brand p {
          color: var(--studio-silver-muted);
          max-width: 300px;
        }

        .footer-links {
          display: flex;
          gap: 60px;
        }

        .link-group h4 {
          color: var(--royal-gold);
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .link-group a,
        .coming-soon {
          display: block;
          color: var(--studio-silver-muted);
          margin-bottom: 12px;
          font-size: 0.85rem;
        }

        .link-group a:hover {
          color: var(--royal-gold);
        }

        .coming-soon {
          cursor: default;
          opacity: .75;
        }

        .footer-bottom {
          text-align: center;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: var(--studio-silver-muted);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default Layout;
