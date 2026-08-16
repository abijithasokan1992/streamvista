import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUp, Clapperboard, Film, Tv } from "lucide-react";

const chips = [
  { label: "I create and license titles", prompt: "I create films and want to license them on StreamVista" },
  { label: "I buy content for my platform", prompt: "I buy content for an OTT / channel and need screenings" },
  { label: "I'm a studio (paid plans)", prompt: "I'm a studio looking at paid StreamVista plans" },
  { label: "Just exploring rights and reach", prompt: "Explain how StreamVista helps with rights and distribution" },
];

const journeys = [
  { icon: Clapperboard, label: "Create & distribute", sub: "Creators and studios", to: "/creator", accent: "bg-[#8757e7]" },
  { icon: Film, label: "Find content", sub: "Buyers and partners", to: "/buyer", accent: "bg-[#ff792c]" },
  { icon: Tv, label: "Screenings", sub: "Approved titles path", to: "/screenings", accent: "bg-[#1c0b44]" },
];

export default function Home() {
  const [draft, setDraft] = useState("");
  const navigate = useNavigate();

  const openAssistant = (text?: string) => {
    const q = (text ?? draft).trim();
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    openAssistant();
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#160d23]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-[-.05em]">
          <span className="h-8 w-8 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ff8b49,#8757e7_50%,#1c0b44)]" />
          STREAMVISTA
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#journeys">Explore</a>
          <Link to="/buyer">For buyers</Link>
          <Link to="/creator">For creators</Link>
        </nav>
        {/* Soft: one door — not Create Account */}
        <Link
          to="/login"
          className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#160d23] shadow-sm transition hover:border-black/20"
        >
          Enter
        </Link>
      </header>

      <section className="relative mx-auto max-w-3xl px-6 pb-6 pt-10 text-center lg:px-10 lg:pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Stories · Rights · Reach</p>
        <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          Stories <em className="font-serif font-normal">move</em> here.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          One calm path for media. Ask anything — then enter with a magic link when you're ready.
        </p>

        {/* Rocket-style open chat box */}
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-10 overflow-hidden rounded-3xl border border-black/8 bg-white text-left shadow-[0_20px_60px_rgba(22,13,35,0.08)]"
        >
          <label className="sr-only" htmlFor="home-assistant">
            Ask StreamVista
          </label>
          <textarea
            id="home-assistant"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Describe what you need — license a title, find content, or understand StreamVista…"
            className="w-full resize-none border-0 bg-transparent px-5 pb-2 pt-5 text-[15px] leading-6 text-[#160d23] outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between gap-3 px-4 pb-4">
            <span className="text-xs text-slate-400">Guided assistant · no password on this step</span>
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#150b20] text-white transition hover:opacity-90"
              aria-label="Send to assistant"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => openAssistant(c.prompt)}
              className="rounded-full border border-black/10 bg-white/80 px-3.5 py-2 text-left text-xs font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-900"
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Ready for your workspace?{" "}
          <Link className="font-semibold text-violet-700 hover:underline" to="/login">
            Email me a magic link
          </Link>
        </p>
      </section>

      <section id="journeys" className="mx-auto max-w-7xl px-6 pb-14 pt-8 lg:px-10">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
          {journeys.map((j, i) => (
            <Link
              key={j.label}
              to={j.to}
              className={`group flex min-h-40 items-center gap-5 p-7 transition hover:bg-slate-50 ${
                i ? "border-t border-slate-200 md:border-l md:border-t-0" : ""
              }`}
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${j.accent}`}>
                <j.icon />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-lg">{j.label}</strong>
                <small className="mt-1 block text-sm text-slate-500">{j.sub}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-slate-200 px-6 py-7 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-10">
        <span>StreamVista (OPC) Private Limited · Kerala, India</span>
        <span>Home invites · magic link admits · RBAC protects · AI guides</span>
      </footer>
    </main>
  );
}
