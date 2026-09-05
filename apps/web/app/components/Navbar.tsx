import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [sessionUser, setSessionUser] = React.useState<unknown>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => { if (mounted) setSessionUser(data.session?.user ?? null); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (mounted) setSessionUser(session?.user ?? null); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const isAuthenticated = Boolean(sessionUser);
  const close = () => setIsOpen(false);
  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSessionUser(null); close(); navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar" aria-label="Primary">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={close} aria-label="StreamVista home">
          <span className="logo-mark">SV</span><span><strong>STREAMVISTA</strong><small>Visual Content OS</small></span>
        </Link>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Workspace</Link>
          <Link to="/film-os" className="nav-link">Projects</Link>
          <Link to="/crayons-bridge" className="nav-link nav-link-primary">Bridge</Link>
          <Link to="/intelligence" className="nav-link nav-link-intel"><BrainCircuit size={13}/> Intelligence</Link>
          <Link to="/revenue" className="nav-link">Revenue</Link>
          {isAuthenticated ? <><Link to="/profile" className="nav-link">Account</Link><button type="button" onClick={handleLogout} className="icon-btn" aria-label="Log out"><LogOut size={16}/></button></> : <Link to="/login" className="login-btn">Sign in</Link>}
        </div>
        <button type="button" className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}>{isOpen ? <X/> : <Menu/>}</button>
      </div>
      {isOpen && <div className="mobile-menu">
        <Link to="/dashboard" onClick={close}>Workspace</Link><Link to="/film-os" onClick={close}>Projects</Link><Link to="/crayons-bridge" onClick={close}>Bridge</Link><Link to="/intelligence" onClick={close}>Intelligence</Link><Link to="/revenue" onClick={close}>Revenue</Link><Link to={isAuthenticated ? '/profile' : '/login'} onClick={close}>{isAuthenticated ? 'Account' : 'Sign in'}</Link>{isAuthenticated && <button type="button" onClick={handleLogout}>Log out</button>}
      </div>}
      <style>{`
        .navbar{position:fixed;inset:0 0 auto;height:68px;background:rgba(7,8,9,.86);backdrop-filter:blur(20px);border-bottom:1px solid var(--sv-border);z-index:1000}
        .nav-container{width:min(1240px,calc(100% - 40px));height:100%;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
        .nav-logo{display:inline-flex;align-items:center;gap:10px}.logo-mark{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--sv-border-strong);border-radius:8px;font-size:10px;font-weight:800;letter-spacing:.08em}.nav-logo strong{display:block;font-size:12px;letter-spacing:.16em}.nav-logo small{display:block;margin-top:2px;color:var(--sv-dim);font-size:9px;letter-spacing:.05em}.nav-links{display:flex;align-items:center;gap:22px}.nav-link{color:var(--sv-muted);font-size:12px;display:inline-flex;align-items:center;gap:5px}.nav-link:hover,.nav-link-primary{color:var(--sv-text)}.nav-link-intel{color:var(--sv-text)}.login-btn,.icon-btn{min-height:34px;padding:0 12px;border:1px solid var(--sv-border);border-radius:9px;background:rgba(255,255,255,.03);color:var(--sv-text);font-size:12px}.icon-btn{width:34px;padding:0;display:grid;place-items:center}.mobile-toggle{display:none;width:36px;height:36px;border:1px solid var(--sv-border);border-radius:9px;background:rgba(255,255,255,.03);color:var(--sv-text)}.mobile-menu{position:absolute;top:68px;left:0;right:0;background:#090b0c;border-bottom:1px solid var(--sv-border);padding:8px 20px;display:flex;flex-direction:column}.mobile-menu a,.mobile-menu button{padding:14px 0;color:var(--sv-text);background:transparent;border:0;text-align:left;font:inherit}
        @media(max-width:900px){.nav-links{display:none}.mobile-toggle{display:grid;place-items:center}.nav-container{width:min(1240px,calc(100% - 28px))}}
      `}</style>
    </nav>
  );
};

export default Navbar;
