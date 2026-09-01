import { ArrowUpRight, BadgeCheck, Handshake, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Kolumittayi",
    subtitle: "2016 • Malayalam",
    poster: "https://m.media-amazon.com/images/M/MV5BNGVjZDg1YTMtYTlhNS00OWMwLWIyZmUtMTM2NzM5MTE2NjUzXkEyXkFqcGc%40._V1_.jpg",
    proof: "Producer / Crayons Pictures",
    description: "A completed StreamVista/Crayons Pictures film project with documented public production and release evidence.",
    source: "https://en.wikipedia.org/wiki/Kolumittayi",
  },
  {
    title: "Jananam: 1947 Pranayam Thudarunnu",
    subtitle: "2024 • Malayalam",
    poster: "https://img.manoramamax.com/164807/1920x1080_Jananam1947PranayamThudarunnu_164807_e3fcca10-0f89-4373-bdfc-46bd7bf150fd.jpg",
    proof: "Writer • Director • Producer / Crayons Pictures",
    description: "A real StreamVista/Crayons Pictures film project with public promotional and platform evidence.",
    source: "https://www.newindianexpress.com/entertainment/malayalam/2024/Mar/14/i-never-liked-stereotypical-portrayals-of-elderly-women-leela-samson-on-her-new-film",
  },
  {
    title: "Pranayam 1947 — Telugu",
    subtitle: "Telugu availability / version",
    poster: "https://images.plex.tv/photo?scale=1&size=large-1920&url=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Foriginal%2ForjHDpKa5Cj26I2sMSht8f5J2dd.jpg",
    proof: "Availability / version enquiry",
    description: "A separate Telugu opportunity card. Rights, territory, language and platform availability are handled through enquiry rather than assumed in the UI.",
    source: "https://www.primevideo.com/-/te/detail/0SU2P0JPCBA4815TWVR3JMC7QN",
  },
];

export default function RealProjects() {
  const startEnquiry = (project: string, intent: string) => `/chat?project=${encodeURIComponent(project)}&intent=${intent}`;
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-300">Real projects • sales • distribution</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Real work. Real titles. Real commercial enquiries.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">Explore documented StreamVista / Crayons Pictures projects and start an enquiry for rights, licensing, distribution or partnership opportunities.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="aspect-[2/3] overflow-hidden bg-slate-900"><img src={project.poster} alt={`${project.title} official promotional poster`} className="h-full w-full object-cover" loading="lazy" /></div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-300"><BadgeCheck size={15} /> Documented project</div>
                <h2 className="mt-2 text-2xl font-black">{project.title}</h2>
                <p className="mt-1 text-sm font-semibold text-violet-300">{project.subtitle}</p>
                <p className="mt-3 text-sm font-bold text-slate-200">{project.proof}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{project.description}</p>
                <div className="mt-5 grid grid-cols-1 gap-2">
                  <Link to={startEnquiry(project.title, "enquiry")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 hover:bg-violet-100"><MessageCircle size={16} /> Enquire</Link>
                  <Link to={startEnquiry(project.title, "licensing")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"><Handshake size={16} /> Request licensing</Link>
                  <Link to={startEnquiry(project.title, "sales-distribution")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-bold text-violet-200 hover:bg-violet-500/20"><ShieldCheck size={16} /> Sales & distribution</Link>
                </div>
                <a href={project.source} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-300">View public evidence <ArrowUpRight size={13} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
