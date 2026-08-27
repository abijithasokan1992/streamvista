import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Film className="logo-icon" />
          <span className="logo-text">StreamVista</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links">
          <Link to="/crayons-bridge" className="nav-link">Crayons Bridge</Link>
          <Link to="/creator-studio" className="nav-link">Studio</Link>
          <Link to="/revenue" className="nav-link">Revenue</Link>
          <Link to="/crayons-loop" className="nav-link">Loop</Link>
          
          {isAuthenticated ? (
            <div className="nav-auth">
              <Link to="/profile" className="profile-btn">
                <User size={18} />
                <span>Account</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Sign In</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/crayons-bridge" onClick={() => setIsOpen(false)}>Crayons Bridge</Link>
          <Link to="/creator-studio" onClick={() => setIsOpen(false)}>Studio</Link>
          <Link to="/revenue" onClick={() => setIsOpen(false)}>Revenue</Link>
          <Link to="/crayons-loop" onClick={() => setIsOpen(false)}>Loop</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: var(--glass-surface);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          z-index: 1000;
          display: flex;
          align-items: center;
          transition: var(--transition-smooth);
        }

        .nav-container {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--royal-gold);
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
        }

        .nav-links {
          display: none;
          align-items: center;
          gap: 32px;
        }

        @media (min-width: 1024px) {
          .nav-links {
            display: flex;
          }
        }

        .nav-link {
          color: var(--studio-silver-muted);
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nav-link:hover {
          color: var(--royal-gold);
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-left: 20px;
          border-left: 1px solid var(--glass-border);
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--studio-silver);
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 4px;
          border: 1px solid var(--glass-border);
        }

        .logout-btn {
          color: var(--studio-silver-muted);
        }

        .logout-btn:hover {
          color: #ff4444;
        }

        .login-btn {
          background: var(--royal-gold);
          color: var(--obsidian);
          padding: 10px 24px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .mobile-toggle {
          display: block;
          color: var(--royal-gold);
        }

        @media (min-width: 1024px) {
          .mobile-toggle {
            display: none;
          }
        }

        .mobile-menu {
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          background: var(--obsidian);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-bottom: 1px solid var(--glass-border);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
