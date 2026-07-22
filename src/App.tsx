import { Play, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <div className="bg-glow-top"></div>
      <div className="bg-glow-bottom"></div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <Play fill="currentColor" size={24} color="var(--primary)" />
          <span>StreamVista</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">Creators</a>
          <a href="#" className="nav-link">Pricing</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}>Log in</button>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero">
        <div className="hero-badge animate-fade-in delay-100">
          ✨ Introducing Next-Gen Streaming
        </div>
        <h1 className="hero-title animate-fade-in delay-200">
          Your World, <span className="text-gradient">Broadcasted</span> Beautifully.
        </h1>
        <p className="hero-subtitle animate-fade-in delay-300">
          StreamVista gives you the tools to create, manage, and monetize your content with unparalleled clarity and zero latency.
        </p>
        <div className="hero-actions animate-fade-in" style={{ animationDelay: '400ms' }}>
          <button className="btn btn-primary btn-lg">
            Start Streaming For Free <ArrowRight size={20} />
          </button>
          <button className="btn btn-outline btn-lg">
            View Documentation
          </button>
        </div>
      </main>

      {/* Features */}
      <section className="features animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="feature-card">
          <div className="feature-icon">
            <Zap size={24} />
          </div>
          <h3 className="feature-title">Ultra-Low Latency</h3>
          <p className="feature-desc">
            Experience real-time interaction with your audience. Our global edge network ensures sub-second latency worldwide.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Shield size={24} />
          </div>
          <h3 className="feature-title">Secure & Private</h3>
          <p className="feature-desc">
            End-to-end encryption and robust access controls give you complete ownership over who sees your content.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Sparkles size={24} />
          </div>
          <h3 className="feature-title">AI-Powered Tools</h3>
          <p className="feature-desc">
            Automatically generate highlights, subtitles, and scene cuts using our integrated artificial intelligence engine.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
