import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  ArrowRight,
  X,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Film,
  Briefcase,
  Tv,
  DollarSign
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  // Carousel Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Crayons Bridge Global Distribution Network",
      subtitle: "Connecting creators with worldwide buyers through comprehensive licensing channels.",
      tag: "Global Network",
      bg: "from-cyan-900 via-slate-900 to-slate-950",
      accent: "#00B4D8"
    },
    {
      title: "Rights-Ready Catalog & Smart Screening",
      subtitle: "Present your feature films, series & documentaries with verified chain-of-title.",
      tag: "Verified Quality",
      bg: "from-blue-900 via-slate-900 to-slate-950",
      accent: "#3B82F6"
    },
    {
      title: "StreamVista Cloud Studio OS & B2B Escrow",
      subtitle: "Run professional delivery workflows, locked escrow deals, and instant payouts.",
      tag: "Studio OS",
      bg: "from-emerald-900 via-slate-900 to-slate-950",
      accent: "#10B981"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Selected Movie for Modal Detail View
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  const catalogMovies = [
    {
      id: "imran-3185",
      title: "Imran 3:185",
      director: "Mamas Ramachandran",
      year: "2024",
      type: "Feature Film",
      language: "Malayalam",
      duration: "110 min",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
      synopsis: "Shree is a debutant director in the process of writing his script. When an unexpected childhood friend returns, a dramatic sequence of events unlocks mysterious hidden truths.",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      rights: ["Worldwide OTT", "Satellite", "FAST Channels"]
    },
    {
      id: "jananam-1947",
      title: "Jananam 1947 Pranayam Thudarunnu",
      director: "Abijith Asokan",
      year: "2024",
      type: "Feature Film",
      language: "Malayalam",
      duration: "115 min",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
      synopsis: "A touching emotional story following senior citizens finding companionship and rekindling love late in life against heartwarming rural backdrops.",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      rights: ["Worldwide OTT", "Digital SVOD", "Pay-Per-View"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 lg:px-12 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-cyan-500/20">
            SV
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              StreamVista <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Cloud X</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Crayons Bridge Python Ecosystem</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#marketplace" className="hover:text-cyan-400 transition-colors">Marketplace</a>
          <a href="#workspaces" className="hover:text-cyan-400 transition-colors">Workspaces</a>
          <a href="#partners" className="hover:text-cyan-400 transition-colors">Distribution Partners</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate("/workspace")}
            className="text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            Launch OS <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* 2. Hero Section with Exact Copy */}
      <section className="relative pt-12 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        {/* Badges */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 mb-8 shadow-sm">
          <span className="text-cyan-400">Film Sales</span>
          <span className="text-slate-600">•</span>
          <span className="text-blue-400">OTT & FAST Licensing</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">Satellite & Digital Distribution Workflow</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Connect Film Content Owners with <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Global Buyers</span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          StreamVista connects creators, filmmakers, producers, studios and rights holders with verified OTT platforms, broadcasters, satellite television, FAST channels, distributors and digital streaming services worldwide.
        </p>

        <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto font-normal">
          Prepare rights-ready catalogues, present your films, series and documentaries to qualified buyers, and run professional delivery workflows in one place.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate("/workspace?role=creator")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Get Started · I'm a Creator <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => navigate("/workspace?role=global_buyer")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            I'm a Buyer · Request Access
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-slate-500 max-w-xl mx-auto italic">
          StreamVista provides professional connectivity and workflow support. Buyer response, licensing, distribution, release and revenue are not guaranteed.
        </p>

        {/* 3. Hero Carousel Banner */}
        <div className="mt-12 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 text-white">
          <div className={`p-8 md:p-14 bg-gradient-to-r ${slides[currentSlide].bg} transition-all duration-700 min-h-[300px] flex flex-col justify-center text-left relative`}>
            <span className="inline-block px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
              {slides[currentSlide].tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">
              {slides[currentSlide].title}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>

            {/* Carousel Controls */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <button 
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white backdrop-blur border border-slate-700 transition-all cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-mono font-bold px-2 text-slate-300">
                {currentSlide + 1} / {slides.length}
              </span>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-white backdrop-blur border border-slate-700 transition-all cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Distribution Partners Marquee */}
      <section id="partners" className="py-14 bg-slate-900/60 border-y border-slate-800 px-6 lg:px-12 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 mb-8">
          Global Distribution Partners & Channels
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <span className="text-xl font-black tracking-tighter text-slate-200">NETFLIX</span>
          <span className="text-xl font-bold tracking-tight text-slate-200">prime video</span>
          <span className="text-xl font-black tracking-tight text-slate-200">Disney+ hotstar</span>
          <span className="text-xl font-bold text-slate-200">Sony LIV</span>
          <span className="text-xl font-black text-slate-200">ZEE5</span>
          <span className="text-xl font-bold text-slate-200">Asianet</span>
          <span className="text-xl font-bold text-cyan-400">crayons loop</span>
        </div>
      </section>

      {/* 5. Rights-Ready Film Showcase */}
      <section id="marketplace" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Live Catalogue</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Featured Rights-Ready Titles</h2>
          </div>
          <button 
            onClick={() => navigate("/workspace?role=global_buyer")}
            className="text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-4 md:mt-0 cursor-pointer"
          >
            Browse Full Marketplace <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {catalogMovies.map((movie) => (
            <div 
              key={movie.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row gap-6 shadow-xl hover:border-slate-700 transition-all group"
            >
              <div className="w-full sm:w-48 h-64 rounded-xl overflow-hidden relative shrink-0 bg-slate-950">
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur text-cyan-400 border border-cyan-500/30 text-[11px] font-bold px-2.5 py-1 rounded-md">
                  {movie.type}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{movie.title}</h3>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mt-1.5">
                    <span>Dir: {movie.director}</span>
                    <span>•</span>
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.duration}</span>
                  </div>

                  <p className="text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {movie.synopsis}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {movie.rights.map((r, i) => (
                      <span key={i} className="text-xs font-semibold bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedMovie(movie)}
                    className="w-full text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" /> View Details & Screener
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 6-Workspaces Section */}
      <section id="workspaces" className="py-20 bg-slate-900 border-t border-slate-800 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest">Unified Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Six Dedicated OS Workspaces</h2>
            <p className="text-slate-300 text-base mt-3">
              StreamVista Cloud X brings every industry participant into one streamlined environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "🎬 Creator Workspace", role: "creator", desc: "Upload vertical videos, scripts, shorts & music. Configure rights & buy promo boosts." },
              { title: "🏢 Studio / Producer", role: "studio_producer", desc: "Manage film slates, store camera raws, censor certificates & studio payouts." },
              { title: "🌐 Global Buyer", role: "global_buyer", desc: "Search verified catalogs, watch watermarked screeners & submit licensing offers." },
              { title: "💼 Investor", role: "investor", desc: "View live earnings, track project ROI & inspect transparent studio audit logs." },
              { title: "📺 Consumer (Crayons Loop)", role: "consumer", desc: "Stream films, series, and vertical videos via subscription, ads, or pay-per-view." },
              { title: "🛡️ Admin OS", role: "admin_os", desc: "Central ops with Legal, QC, Matchmaker & Finance sub-roles for complete escrow control." }
            ].map((ws, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/workspace?role=${ws.role}`)}
                className="bg-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-6 cursor-pointer hover:bg-slate-800/80 transition-all group"
              >
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                  {ws.title}
                  <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </h3>
                <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 lg:px-12 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2025 Crayons Bridge – RD 360 – Powered by Crayons Pictures Union (Streamvista OPC Private Limited). All Rights Reserved.</p>
          <div className="flex items-center gap-6 text-slate-300 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Legal Escrow</a>
          </div>
        </div>
      </footer>

      {/* 8. Movie Detail Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-slate-700">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="aspect-video bg-black relative">
              <video 
                src={selectedMovie.trailerUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-md">
                  {selectedMovie.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedMovie.language} • {selectedMovie.duration}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">{selectedMovie.title}</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">Director: {selectedMovie.director} ({selectedMovie.year})</p>

              <p className="text-sm text-slate-300 mt-5 leading-relaxed">
                {selectedMovie.synopsis}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.rights.map((r: string, i: number) => (
                    <span key={i} className="text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-md font-semibold border border-slate-700">
                      {r}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setSelectedMovie(null);
                    navigate("/workspace?role=global_buyer");
                  }}
                  className="w-full sm:w-auto text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Make B2B Licensing Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
