import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const featured = [
  { title: 'Featured Premiere', meta: 'Crayons Original • Malayalam', blurb: 'A cinematic home for independent stories, originals and curated films.', accent: 'PREMIERE' },
  { title: 'New on LOOP', meta: 'Movies • Series • Shorts', blurb: 'Fresh releases and hidden gems selected for your next watch.', accent: 'NEW' },
  { title: 'Watch Free', meta: 'Free catalogue', blurb: 'Start watching with no subscription, then upgrade when premium access fits you.', accent: 'FREE' },
];

const rows = [
  { name: 'Popular on LOOP', items: ['The First Cut', 'Night Shift', 'City of Stories', 'After the Rain'] },
  { name: 'Malayalam Spotlight', items: ['Kerala Frames', 'Between Takes', 'Homebound', 'One More Scene'] },
];

export default function CrayonsLoopHome() {
  const [search, setSearch] = useState('');
  const [hero, setHero] = useState(0);
  const filtered = useMemo(() => search.trim() ? rows.map(r => ({ ...r, items: r.items.filter(i => i.toLowerCase().includes(search.toLowerCase())) })).filter(r => r.items.length) : rows, [search]);

  useEffect(() => {
    const id = window.setInterval(() => setHero(v => (v + 1) % featured.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 md:px-8">
          <Link to="/loop" className="text-lg font-black tracking-[0.22em] text-white">CRAYONS <span className="text-zinc-500">LOOP</span></Link>
          <nav className="hidden items-center gap-5 text-sm text-white/60 md:flex">
            <Link to="/loop" className="text-white">Home</Link><Link to="/loop/browse">Browse</Link><Link to="/loop/my-list">My List</Link><Link to="/loop/plans">Plans</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="hidden w-44 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none placeholder:text-white/25 focus:border-white/25 sm:block" />
            <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 hover:bg-white/5">Sign in</Link>
            <Link to="/loop/plans" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">Get LOOP</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold tracking-[0.35em] text-white/35">CRAYONS LOOP • DIGITAL STREAMING</div>
            <h1 className="mt-5 text-5xl font-medium tracking-[-0.05em] md:text-7xl">Your stories. One loop.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/50 md:text-lg">Discover films, originals, series and independent voices in a premium streaming experience built for Crayons.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/loop/browse" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Start browsing</Link>
              <Link to="/loop/plans" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80">View plans</Link>
            </div>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {featured.map((item, i) => (
              <article key={item.title} className={`rounded-3xl border p-6 transition ${i === hero ? 'border-white/25 bg-white/[0.08]' : 'border-white/10 bg-white/[0.025]'}`}>
                <div className="text-[10px] font-bold tracking-[0.24em] text-white/35">{item.accent}</div>
                <h2 className="mt-14 text-2xl font-medium">{item.title}</h2>
                <div className="mt-2 text-sm text-white/45">{item.meta}</div>
                <p className="mt-4 text-sm leading-6 text-white/55">{item.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        {filtered.map(row => (
          <div key={row.name} className="mb-12">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-medium tracking-tight">{row.name}</h2><Link to="/loop/browse" className="text-sm text-white/40 hover:text-white">See all →</Link></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {row.items.map(item => <Link key={item} to={`/loop/title/${encodeURIComponent(item.toLowerCase().replace(/\s+/g, '-'))}`} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"><div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-white/10 via-white/[0.03] to-black" /><div className="mt-4 text-sm font-medium text-white/85">{item}</div><div className="mt-1 text-xs text-white/30">Play on Crayons LOOP →</div></Link>)}
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between md:px-8"><div>© {new Date().getFullYear()} Crayons LOOP</div><div className="flex gap-4"><Link to="/loop/account">Account</Link><Link to="/loop/plans">Subscriptions</Link><Link to="/loop/admin">Admin</Link></div></div>
      </footer>
    </main>
  );
}
