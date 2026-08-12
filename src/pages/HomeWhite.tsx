import { ArrowRight, Clapperboard, Film, Tv } from "lucide-react";

const journeys = [
  { icon: Clapperboard, title: "Create & distribute", copy: "For creators and studios moving rights-ready work." },
  { icon: Film, title: "Find content", copy: "For buyers and partners discovering curated titles." },
  { icon: Tv, title: "Watch", copy: "Crayons Loop screenings and programmed experiences." },
];

export default function HomeWhite() {
  return (
    <main className="min-h-screen bg-[#F9F6F0] text-[#111111]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <a href="https://www.streamvista.in" className="flex items-center gap-3 font-black tracking-[-0.05em] text-[#1E4FC7]">
          <span className="h-8 w-8 rounded-full bg-[#1E4FC7]" />
          STREAMVISTA
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-zinc-500 sm:inline-flex">White</span>
          <a href="https://chat.streamvista.in/login" className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white">Sign in</a>
        </div>
      </header>

      <section className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-16">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Stories · Rights · Reach</p>
          <h1 className="mt-6 max-w-3xl font-serif text-6xl leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-[88px]">
            Stories move here.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-600">
            One clear path for media: create, protect rights, discover opportunities, distribute, and reach the right audience.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="https://chat.streamvista.in/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E4FC7] px-6 py-3 text-sm font-bold text-white">
              Talk to StreamVista AI <ArrowRight size={16} />
            </a>
            <a href="https://chat.streamvista.in/login" className="text-sm font-semibold text-zinc-700 hover:text-black">Already have an account? Sign in</a>
          </div>
        </div>

        <div className="relative mx-auto h-[420px] w-[420px] max-w-full">
          <div className="absolute inset-[7%] rounded-full bg-[radial-gradient(circle_at_30%_28%,#7ec8ff_0%,#6c63ff_34%,#5b2fcf_58%,#20103d_82%)] shadow-[0_42px_100px_rgba(75,58,180,.26)]" />
          <div className="absolute inset-[20%] rounded-full border border-white/30" />
          <div className="absolute inset-[34%] rounded-full border border-white/20" />
          <div className="absolute bottom-8 right-1 rounded-full bg-white/90 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#1E4FC7] shadow-xl backdrop-blur">Rights first</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
        <div className="grid gap-3 md:grid-cols-3">
          {journeys.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-3xl bg-[#111111] p-7 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Icon size={20} /></div>
              <h2 className="mt-7 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-black/10 px-6 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>StreamVista (OPC) Private Limited · Kerala, India</span>
        <span>Through Crayons Bridge Engine</span>
      </footer>
    </main>
  );
}
