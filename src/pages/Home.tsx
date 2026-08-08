import { Link } from "react-router-dom";

const pillars = [
  {
    title: "Create & Prepare",
    text: "Organize titles, metadata, media assets, QC and delivery readiness in one professional workspace.",
  },
  {
    title: "Control Rights",
    text: "Keep rights, documents, approvals and access decisions visible before commercial activity begins.",
  },
  {
    title: "License & Deliver",
    text: "Move approved content through buyer review, deal coordination and secure delivery workflows.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.28em] text-sky-400">STREAMVISTA</p>
            <p className="mt-1 text-xs text-slate-400">Media Business Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5">
              Sign in
            </Link>
            <a href="https://streamvistacreator-com.vercel.app/" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
              Creator Cloud
            </a>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-300">
              One workspace from content to commercial readiness
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Build. License. Distribute. Grow.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              StreamVista gives creators, studios, rights holders and media teams a secure operating layer for preparing, controlling and moving content through professional distribution workflows.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/workspace" className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                Open platform →
              </Link>
              <a href="mailto:support-bridge@crayonspictures.com?subject=StreamVista%20Business%20Enquiry" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                Business enquiry
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Licensing, distribution and revenue are subject to rights, QC, buyer review and written commercial terms.
            </p>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-sky-950/30 backdrop-blur sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400">PLATFORM FLOW</p>
            <div className="mt-6 space-y-4">
              {["Content & metadata", "Rights & legal", "QC & readiness", "Buyer & deal workflow", "Delivery & reporting"].map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/10 text-xs font-bold text-sky-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="grid gap-4 border-t border-white/10 py-10 md:grid-cols-3">
          {pillars.map(({ title, text }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>StreamVista (OPC) Private Limited · Kerala, India</span>
          <span>Secure media operations · Rights-first distribution</span>
        </footer>
      </div>
    </main>
  );
}
