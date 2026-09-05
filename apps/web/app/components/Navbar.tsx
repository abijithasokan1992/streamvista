import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
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
    navigate('/login', { replace: true });
  };

  const closeMenus = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/crayons-bridge" className="nav-logo" aria-label="Crayons Bridge home" onClick={closeMenus}>
          <Film className="logo-icon" aria-hidden="true" />
          <span>
            <strong>Crayons</strong>
            <small>Bridge</small>
          </span>
        </Link>

        <div className="nav-links" aria-label="Primary navigation">
          <Link to="/crayons-bridge" className="nav-link nav-link-primary">Bridge</Link>
          {isAuthenticated && <Link to="/profile" className="nav-link">Account</Link>}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="logout-btn" aria-label="Log out" title="Log out">
              <LogOut size={16} aria-hidden="true" />
            </button>
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
          <Link to="/crayons-bridge" onClick={closeMenus}>Bridge</Link>
          <Link to={isAuthenticated ? '/profile' : '/login'} onClick={closeMenus}>{isAuthenticated ? 'Account' : 'Sign in'}</Link>
          {isAuthenticated && <button type="button" onClick={handleLogout}>Log out</button>}
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

        .logo-icon { width: 23px; height: 23px; color: var(--royal-gold); }
        .nav-logo strong { display: block; color: var(--studio-silver); font-family: var(--font-display); font-size: 0.98rem; letter-spacing: 0.08em; text-transform: uppercase; }
        .nav-logo small { display: block; margin-top: 3px; color: var(--studio-silver-muted); font-size: 0.57rem; letter-spacing: 0.2em; text-transform: uppercase; }
        .nav-links { display: none; align-items: center; gap: 25px; }
        @media (min-width: 1024px) { .nav-links { display: flex; } }
        .nav-link, .login-btn { color: var(--studio-silver-muted); text-decoration: none; font-size: 0.78rem; letter-spacing: 0.04em; background: transparent; border: 0; cursor: pointer; }
        .nav-link:hover { color: var(--studio-silver); }
        .nav-link-primary { color: var(--royal-gold); }
        .account-link { color: var(--studio-silver-muted); text-decoration: none; font-size: 0.78rem; }
        .login-btn { padding: 9px 14px; border: 1px solid rgba(255,255,255,.1); border-radius: 999px; background: rgba(255,255,255,.035); color: var(--studio-silver); }
        .logout-btn { display:grid; place-items:center; width:34px; height:34px; border-radius:999px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:var(--studio-silver-muted); cursor:pointer; }
        .logout-btn:hover { color:var(--studio-silver); }
        .mobile-toggle { display:grid; place-items:center; width:38px; height:38px; border:1px solid rgba(255,255,255,.08); border-radius:10px; background:rgba(255,255,255,.03); color:var(--studio-silver); }
        @media (min-width: 1024px) { .mobile-toggle { display:none; } }
        .mobile-menu { position:absolute; top:68px; left:0; right:0; display:flex; flex-direction:column; gap:0; background:#0a0a0a; border-bottom:1px solid rgba(255,255,255,.08); padding:8px 5%; }
        .mobile-menu a, .mobile-menu button { padding:14px 0; color:var(--studio-silver); text-decoration:none; text-align:left; border:0; background:transparent; font:inherit; }
      `}</style>
    </nav>
  );
};

export default Navbar;
