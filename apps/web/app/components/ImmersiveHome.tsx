import React, { useEffect, useRef, useState } from 'react';

const systems = [
  { label: 'CREATE', title: 'Build from production to cloud.', text: 'Capture, ingest, organize and prepare every visual asset in one cinematic workspace.' },
  { label: 'PROTECT', title: 'Trust every asset.', text: 'Identity, rights, ownership and controlled access form the trust layer behind every transaction.' },
  { label: 'CONNECT', title: 'Put content in motion.', text: 'Bring creators, studios and qualified buyers into one connected commercial network.' },
  { label: 'DISTRIBUTE', title: 'From master to market.', text: 'Move approved content through QC, delivery, OTT and distribution workflows.' },
];

export default function ImmersiveHome() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--mx', `${x}`);
      el.style.setProperty('--my', `${y}`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <main className="sv-home">
      <section className="sv-hero" ref={heroRef}>
        <div className="sv-grid" />
        <div className="sv-orbit sv-orbit-a" />
        <div className="sv-orbit sv-orbit-b" />
        <div className="sv-core" aria-hidden="true">
          <div className="sv-core-ring sv-core-ring-1" />
          <div className="sv-core-ring sv-core-ring-2" />
          <div className="sv-core-ring sv-core-ring-3" />
          <div className="sv-core-pulse" />
          <div className="sv-core-label">SV / CORE</div>
        </div>

        <nav className="sv-nav">
          <a href="/" className="sv-brand" aria-label="StreamVista home">STREAMVISTA</a>
          <div className="sv-nav-links">
            <a href="#ecosystem">Ecosystem</a>
            <a href="#bridge">Crayons Bridge</a>
            <a href="/pricing">Pricing</a>
            <a href="/login">Sign in</a>
          </div>
        </nav>

        <div className="sv-hero-copy">
          <div className="sv-eyebrow">VISUAL CONTENT INFRASTRUCTURE</div>
          <h1>The operating system for visual content.</h1>
          <p>
            Create, protect, connect and distribute content through one real production,
            rights and commerce ecosystem.
          </p>
          <div className="sv-actions">
            <a className="sv-btn sv-btn-primary" href="/signup">Enter StreamVista <span>↗</span></a>
            <a className="sv-btn sv-btn-ghost" href="#ecosystem">Explore ecosystem</a>
          </div>
        </div>

        <div className="sv-telemetry">
          <span>LIVE SYSTEM</span><i /> <span>CONTENT → RIGHTS → MARKET</span>
        </div>
      </section>

      <section id="ecosystem" className="sv-section sv-ecosystem">
        <div className="sv-section-head">
          <div>
            <div className="sv-eyebrow">THE STREAMVISTA UNIVERSE</div>
            <h2>One system. Four movements.</h2>
          </div>
          <p>Designed as infrastructure, experienced like a studio.</p>
        </div>
        <div className="sv-system-grid">
          {systems.map((item, index) => (
            <button
              key={item.label}
              className={`sv-system-card ${active === index ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              type="button"
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
              <em>0{index + 1}</em>
            </button>
          ))}
        </div>
        <div className="sv-system-stage">
          <div className="sv-stage-orb" />
          <div className="sv-stage-line line-a" />
          <div className="sv-stage-line line-b" />
          <div className="sv-stage-panel">
            <span>{systems[active].label}</span>
            <strong>{systems[active].title}</strong>
            <small>{systems[active].text}</small>
          </div>
        </div>
      </section>

      <section id="bridge" className="sv-section sv-bridge">
        <div className="sv-bridge-visual">
          <div className="sv-bridge-core">
            {['RIGHTS', 'METADATA', 'SCREENER', 'BUYER', 'DEAL', 'PAYMENT'].map((node, index) => (
              <div key={node} className={`sv-node node-${index + 1}`}><span>{node}</span></div>
            ))}
            <div className="sv-bridge-center">BRIDGE</div>
          </div>
        </div>
        <div className="sv-bridge-copy">
          <div className="sv-eyebrow">CRAYONS BRIDGE</div>
          <h2>Where content becomes commerce.</h2>
          <p>
            Rights verification, buyer access, deal rooms and payment workflows converge
            into one controlled path from asset to licensed outcome.
          </p>
          <a className="sv-text-link" href="/crayons-bridge">Explore Crayons Bridge →</a>
        </div>
      </section>

      <section className="sv-section sv-command">
        <div className="sv-command-copy">
          <div className="sv-eyebrow">COMMAND LAYER</div>
          <h2>Turn a brief into a production path.</h2>
          <p>
            The future interface is not another dashboard. It is a command layer over the
            real StreamVista services, workflows and data you already own.
          </p>
        </div>
        <div className="sv-command-window">
          <div className="sv-window-top"><span>STREAMVISTA / COMMAND</span><span>READY</span></div>
          <div className="sv-command-prompt">Prepare this film for OTT licensing.</div>
          <div className="sv-command-flow">
            {['INGEST', 'QC', 'METADATA', 'RIGHTS', 'PACKAGE', 'MARKET'].map((step) => <span key={step}>{step}</span>)}
          </div>
        </div>
      </section>

      <footer className="sv-footer">
        <div className="sv-brand">STREAMVISTA</div>
        <div>CREATE. PROTECT. CONNECT. DISTRIBUTE.</div>
        <a href="/login">Enter workspace ↗</a>
      </footer>
    </main>
  );
}
