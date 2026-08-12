import { Link } from "react-router-dom";
import { ArrowRight, Bot, Clapperboard, Film, Tv } from "lucide-react";

const journeys = [
  { icon: Clapperboard, label: "Create & distribute", sub: "For creators and studios", to: "/creator", accent: "bg-[#8757e7]" },
  { icon: Film, label: "Find content", sub: "For buyers and partners", to: "/buyer", accent: "bg-[#ff792c]" },
  { icon: Tv, label: "Watch", sub: "Crayons Loop", to: "/screenings", accent: "bg-[#1c0b44]" },
];

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-[#f7f5f0] text-[#160d23]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
      <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-[-.05em]"><span className="h-8 w-8 rounded-full bg-violet-600"/>STREAMVISTA</Link>
      <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex"><a href="#journeys">Explore</a><Link to="/buyer">For buyers</Link><Link to="/creator">For creators</Link></nav>
      <Link to="/login" className="rounded-full bg-[#150b20] px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link>
    </header>

    <section className="relative mx-auto grid min-h-[610px] max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-[1fr_.86fr] lg:px-10 lg:py-20">
      <div className="relative z-10"><p className="eyebrow">Stories · Rights · Reach</p><h1 className="mt-5 max-w-4xl text-6xl font-black leading-[.88] tracking-[-.075em] sm:text-7xl lg:text-[104px]">Stories <em className="font-serif font-normal">move</em><br/>here.</h1><p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">One clear path for media: create, discover, distribute and reach the right audience.</p><Link to="/ai" className="primary-action mt-9">Talk to StreamVista AI <ArrowRight size={16}/></Link><p className="mt-5 text-sm text-slate-500">Already have an account? <Link className="font-semibold text-violet-700" to="/login">Sign in</Link></p></div>
      <div className="relative mx-auto h-[390px] w-[390px] max-w-full"><div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#ff8b49_0%,#824ce3_43%,#20103d_74%)] shadow-[0_38px_90px_rgba(95,55,180,.32)]"/><div className="absolute inset-[21%] rounded-full border border-white/30"/><div className="absolute bottom-4 right-2 flex h-20 w-20 items-center justify-center rounded-full bg-white/85 shadow-xl backdrop-blur"><Bot className="text-violet-700"/></div></div>
    </section>

    <section id="journeys" className="mx-auto max-w-7xl px-6 pb-14 lg:px-10"><div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">{journeys.map((j,i)=><Link key={j.label} to={j.to} className={`group flex min-h-44 items-center gap-5 p-7 transition hover:bg-slate-50 ${i ? "border-t md:border-l md:border-t-0 border-slate-200" : ""}`}><span className={`flex h-14 w-14 items-center justify-center rounded-full text-white ${j.accent}`}><j.icon/></span><span className="min-w-0 flex-1"><strong className="block text-xl">{j.label}</strong><small className="mt-1 block text-sm text-slate-500">{j.sub}</small></span><ArrowRight className="transition group-hover:translate-x-1"/></Link>)}</div></section>
    <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-slate-200 px-6 py-7 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-10"><span>StreamVista (OPC) Private Limited · Kerala, India</span><span>Rights-first media operations</span></footer>
  </main>;
}
