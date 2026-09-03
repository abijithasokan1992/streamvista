import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [sessionUser, setSessionUser] = React.useState<unknown>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!supabase) {
      setSessionUser(null);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSessionUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = Boolean(sessionUser);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSessionUser(null);
    setIsOpen(false);
    setMoreOpen(false);
    navigate('/login', { replace: true });
  };

  const closeMenus = () => {
    setIsOpen(false);
    setMoreOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/crayons-pictures" className="nav-logo" aria-label="Crayons Pictures home" onClick={closeMenus}>
          <Film className="logo-icon" aria-hidden="true" />
          <span>
            <strong>Crayons</strong>
            <small>Pictures</small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Primary navigation">
          <Link to="/dashboard" className="nav-link">Projects</Link>
          <Link to="/creator-studio" className="nav-link">Studio</Link>
          <Link to="/crayons-bridge" className="nav-link">Bridge</Link>
          <Link to="/crayons-loop" className="nav-link">Loop</Link>

          <div className="more-wrap">
            <button
              type="button"
              className="nav-link nav-more"
              onClick={() => setMoreOpen((value) => !value)}
              aria-expanded={moreOpen}
            >
              More <ChevronDown size={14} aria-hidden="true" />
            </button>
            {moreOpen && (
              <div className="more-menu">
                <Link to="/revenue" onClick={closeMenus}>Revenue</Link>
                <Link to="/enterprise" onClick={closeMenus}>Enterprise</Link>
                <Link to="/crayons-vault" onClick={closeMenus}>Vault</Link>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="nav-account">
              <Link to="/profile" className="account-link">Account</Link>
              <button type="button" onClick={handleLogout} className="logout-btn" aria-label="Log out" title="Log out">
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Sign in</Link>
          )}
        </div>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={closeMenus}>Projects</Link>
          <Link to="/creator-studio" onClick={closeMenus}>Studio</Link>
          <Link to="/crayons-bridge" onClick={closeMenus}>Bridge</Link>
          <Link to="/crayons-loop" onClick={closeMenus}>Loop</Link>
          <Link to="/revenue" onClick={closeMenus}>Revenue</Link>
          <Link to={isAuthenticated ? '/profile' : '/login'} onClick={closeMenus}>{isAuthenticated ? 'Account' : 'Sign in'}</Link>
          {isAuthenticated && (
            <button type="button" onClick={handleLogout}>Log out</button>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          inset: 0 0 auto;
          height: 68px;
          background: rgba(10, 10, 10, 0.86);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 1000;
        }

        .nav-container {
          width: min(94%, 1320px);
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--studio-silver);
          text-decoration: none;
          line-height: 1;
        }

        .logo-icon {
          width: 23px;
          height: 23px;
          color: var(--royal-gold);
        }

        .nav-logo strong {
          display: block;
          color: var(--studio-silver);
          font-family: var(--font-display);
          font-size: 0.98rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .nav-logo small {
          display: block;
          margin-top: 3px;
          color: var(--studio-silver-muted);
          font-size: 0.57rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .nav-links {
          display: none;
          align-items: center;
          gap: 25px;
        }

        @media (min-width: 1024px) {
          .nav-links { display: flex; }
        }

        .nav-link,
        .account-link {
          color: var(--studio-silver-muted);
          background: transparent;
          border: 0;
          padding: 4px 0;
          font: inherit;
          font-size: 0.79rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .nav-link:hover,
        .account-link:hover,
        .nav-more:hover {
          color: var(--studio-silver);
        }

        .nav-more {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .more-wrap { position: relative; }

        .more-menu {
          position: absolute;
          top: 30px;
          right: 0;
          min-width: 160px;
          padding: 8px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        }

        .more-menu a {
          display: block;
          padding: 9px 10px;
          color: var(--studio-silver-muted);
          font-size: 0.78rem;
          text-decoration: none;
          border-radius: 5px;
        }

        .more-menu a:hover {
          color: var(--studio-silver);
          background: rgba(255,255,255,0.05);
        }

        .nav-account {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-left: 4px;
          padding-left: 18px;
          border-left: 1px solid rgba(255,255,255,0.09);
        }

        .logout-btn {
          display: inline-flex;
          padding: 4px;
          color: var(--studio-silver-muted);
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .logout-btn:hover { color: var(--studio-silver); }

        .login-btn {
          color: var(--obsidian);
          background: var(--royal-gold);
          padding: 8px 15px;
          border-radius: 5px;
          font-size: 0.76rem;
          font-weight: 650;
          text-decoration: none;
        }

        .mobile-toggle {
          display: inline-flex;
          padding: 6px;
          color: var(--studio-silver);
          background: transparent;
          border: 0;
        }

        @media (min-width: 1024px) {
          .mobile-toggle { display: none; }
        }

        .mobile-menu {
          position: absolute;
          top: 68px;
          left: 0;
          right: 0;
          padding: 18px 5%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: rgba(10,10,10,0.98);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .mobile-menu a,
        .mobile-menu button {
          display: block;
          width: 100%;
          padding: 12px 0;
          color: var(--studio-silver);
          text-align: left;
          text-decoration: none;
          background: transparent;
          border: 0;
          font: inherit;
          font-size: 0.9rem;
        }

        .mobile-menu a:hover,
        .mobile-menu button:hover { color: var(--royal-gold); }
      `}</style>
    </nav>
  );
};

export default Navbar;
