import "./crayons-loop.css";

const categories = [
  {
    tag: "Cinema",
    title: "Films",
    copy: "Feature films and independent cinema chosen for discovery, not endless scrolling.",
  },
  {
    tag: "Series",
    title: "Series",
    copy: "Episodic stories and worlds worth returning to.",
  },
  {
    tag: "Family",
    title: "Family",
    copy: "A cleaner place for family, kids and all-age entertainment.",
  },
  {
    tag: "Discover",
    title: "New voices",
    copy: "Documentaries, originals and regional storytellers you may not find everywhere else.",
  },
];

export function CrayonsLoopExperience() {
  return (
    <section className="cl-root" aria-label="Crayons Loop entertainment experience">
      <header className="cl-shell cl-nav" id="crayons-loop-top">
        <a className="cl-brand" href="#crayons-loop-top" aria-label="Crayons Loop home">
          <span className="cl-loopmark" aria-hidden="true">
            <span>C</span>
          </span>
          <span className="cl-brandcopy">
            <strong>CRAYONS LOOP</strong>
            <small>Watch something worth your time.</small>
          </span>
        </a>
        <nav className="cl-navlinks" aria-label="Crayons Loop navigation">
          <a href="#crayons-loop-discover">Browse</a>
          <a href="#crayons-loop-experience">Why Loop</a>
          <a href="https://moments.crayonsloop.com" target="_blank" rel="noreferrer">Moments</a>
          <a className="cl-cta" href="https://www.crayonsloop.com" target="_blank" rel="noreferrer">
            Open Crayons Loop
          </a>
        </nav>
      </header>

      <main>
        <section className="cl-shell cl-hero">
          <div className="cl-hero-copy">
            <div className="cl-eyebrow">CRAYONS LOOP · ENTERTAINMENT</div>
            <h1>
              Open Loop.
              <br />
              Find your next story.
            </h1>
            <p>
              Films, series, documentaries, family viewing and regional stories in one focused consumer experience.
              Less clutter. Better discovery.
            </p>
            <div className="cl-actions">
              <a className="cl-cta" href="#crayons-loop-discover">Explore Crayons Loop</a>
              <a className="cl-cta cl-secondary" href="https://moments.crayonsloop.com" target="_blank" rel="noreferrer">
                Private event films → Moments
              </a>
            </div>
            <div className="cl-trust" aria-label="Crayons Loop experience">
              <div className="cl-metric"><strong>Curated</strong><span>Discovery before overload</span></div>
              <div className="cl-metric"><strong>Regional</strong><span>Local stories belong on the front row</span></div>
              <div className="cl-metric"><strong>Simple</strong><span>Consumer-first, every screen</span></div>
              <div className="cl-metric"><strong>Rights-aware</strong><span>Catalogue foundations built responsibly</span></div>
            </div>
          </div>
          <div className="cl-hero-loop" aria-hidden="true">
            <div className="cl-loop-orbit cl-one" />
            <div className="cl-loop-orbit cl-two" />
            <div className="cl-loop-core"><span>C</span></div>
          </div>
        </section>

        <section className="cl-shell cl-section" id="crayons-loop-discover">
          <div className="cl-sectionhead">
            <h2>Pick a lane. Start discovering.</h2>
            <p>
              The public B2C catalogue is organised around what viewers actually want to watch, while playback and
              entitlement remain capability-gated until connected.
            </p>
          </div>
          <div className="cl-cards">
            {categories.map((item) => (
              <article className="cl-card" key={item.title}>
                <span className="cl-tag">{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cl-shell cl-section" id="crayons-loop-experience">
          <div className="cl-sectionhead">
            <h2>One Loop for viewers.</h2>
            <p>
              Crayons Loop is the public entertainment brand. Private wedding and event films stay in Crayons Loop
              Moments so the consumer experience remains clean.
            </p>
          </div>
          <div className="cl-banner">
            <div>
              <span className="cl-tag">CRAYONS LOOP MOMENTS</span>
              <h2>Your private films stay private.</h2>
              <p>Wedding films, celebrations and client deliveries live in a separate experience for studios, clients and families.</p>
            </div>
            <a className="cl-cta" href="https://moments.crayonsloop.com" target="_blank" rel="noreferrer">Open Moments</a>
          </div>
        </section>
      </main>

      <footer className="cl-footer">
        <div className="cl-shell cl-footerrow">
          <span>© 2026 Crayons Loop</span>
          <span>Public entertainment · A StreamVista ecosystem destination</span>
        </div>
      </footer>
    </section>
  );
}
