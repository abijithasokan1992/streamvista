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
  DollarSign,
  Sparkles,
  Lock,
  BarChart3,
  Award,
  Zap
} from "lucide-react";
import { LiveActivityTickerBar } from "../components/LiveActivityTickerBar";

export function LandingPage() {
  const navigate = useNavigate();

  // Carousel Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Jananam 1947 Pranayam Thudarunnu",
      subtitle: "Critically acclaimed Malayalam emotional drama directed by Abijith Asokan. Worldwide B2B rights available.",
      tag: "Flagship B2B Title",
      badge: "North America SVOD Available",
      bg: "from-cyan-950 via-slate-900 to-slate-950",
      accent: "#00B4D8",
      director: "Abijith Asokan",
      cast: "Jayaraj Kozhikode, Leela Samson, Anu Sithara",
      posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Crayons Bridge Global Distribution Engine",
      subtitle: "Direct B2B licensing pipeline connecting creators with global OTT aggregators and broadcast networks.",
      tag: "Enterprise Marketplace",
      badge: "7 Buyer Networks Active",
      bg: "from-emerald-950 via-slate-900 to-slate-950",
      accent: "#10B981",
      director: "Crayons Pictures Union",
      cast: "Worldwide Content Creators",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "StreamVista Cloud Studio OS & B2B Escrow",
      subtitle: "Direct AWS S3 multipart ingestion, non-sublicensable legal governance, and instant escrow dispatches.",
      tag: "Studio OS & Financials",
      badge: "10/90 & 50/50 Split Engine",
      bg: "from-purple-950 via-slate-900 to-slate-950",
      accent: "#8B5CF6",
      director: "StreamVista OPC Pvt Ltd",
      cast: "Super Admin Governance",
      posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop"
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
      id: "jananam-1947",
      title: "Jananam 1947 Pranayam Thudarunnu",
      director: "Abijith Asokan",
      year: "2024",
      type: "Feature Film",
      language: "Malayalam",
      duration: "105 min",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop",
      synopsis: "A touching emotional story following Gowri and Shivan finding companionship and rekindling love late in life against heartwarming rural backdrops.",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      rights: ["Worldwide OTT", "Digital SVOD", "Pay-Per-View"],
      dealValue: "$35,000 USD"
    },
    {
      id: "imran-3185",
      title: "Imran 3:185",
      director: "Mamas Ramachandran",
      year: "2024",
      type: "Feature Film",
      language: "Malayalam",
      duration: "110 min",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
      synopsis: "Shree is a debutant director in the process of writing his script. When an unexpected childhood friend returns, dramatic events unlock hidden truths.",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      rights: ["Worldwide OTT", "Satellite", "FAST Channels"],
      dealValue: "$50,000 USD"
    },
    {
      id: "civilian",
      title: "Civilian (Sivil)",
      director: "Levent Çetin",
      year: "2024",
      type: "Feature Film",
      language: "Turkish",
      duration: "79 min",
      poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop",
      synopsis: "A young military veteran returns to civilian life seeking resolution while confronting psychological trauma and former relationships.",
      trailerUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      rights: ["Worldwide OTT", "Digital Rights"],
      dealValue: "$25,000 USD"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 0. Live Activity Ticker Bar */}
      <LiveActivityTickerBar />

      {/* 1. Ultra-Premium Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-6 lg:px-12 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/25">
            SV
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              StreamVista <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Cloud X</span>
            </span>
            <span className="text-[11px] text-slate-400 font-bold">STREAMVISTA OPC PVT LTD • Crayons Bridge</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/workspace?role=creator")}
            className="text-xs font-black text-slate-300 hover:text-white px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer hidden sm:flex items-center gap-2"
          >
            <Lock size={14} className="text-cyan-400" /> B2B Portal Login
          </button>
          
          <button 
            onClick={() => navigate("/workspace")}
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-xs font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Sparkles size={16} /> Launch Workspace OS 🚀
          </button>
        </div>
      </header>

      {/* 2. Hero Cinematic Carousel Banner */}
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest uppercase">
              <Sparkles size={14} /> {slides[currentSlide].tag} • {slides[currentSlide].badge}
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
              {slides[currentSlide].title}
            </h1>

            <p className="text-base lg:text-lg text-slate-300 font-medium leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/workspace?role=global_buyer")}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Play size={18} fill="currentColor" /> Explore B2B Screener Player
              </button>
              
              <button
                onClick={() => navigate("/workspace?role=creator")}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <Film size={18} className="text-cyan-400" /> Producer RAW Vault
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Non-Sublicensable Mandate</span>
              <span className="flex items-center gap-1.5"><DollarSign size={16} className="text-cyan-400" /> 10/90 & 50/50 Revenue Split</span>
            </div>
          </div>

          {/* Right Movie Poster Card */}
          <div className="relative group cursor-pointer" onClick={() => navigate("/workspace?role=global_buyer")}>
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl aspect-video bg-slate-900">
              <img 
                src={slides[currentSlide].posterUrl} 
                alt={slides[currentSlide].title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-8">
                <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest block">Director: {slides[currentSlide].director}</span>
                <h3 className="text-2xl font-black text-white mt-1">{slides[currentSlide].title}</h3>
                <span className="text-xs text-slate-300 font-medium mt-1">Cast: {slides[currentSlide].cast}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Indicators */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-8 flex items-center justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? "w-12 bg-cyan-400" : "w-3 bg-slate-800 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 3. Global Buyer Network Showcase */}
      <section className="py-12 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6 text-center">
          <span className="text-xs font-black uppercase text-cyan-400 tracking-widest block">
            Trusted Distribution Buyer Network
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-85">
            {["NETFLIX", "PRIME VIDEO", "DISNEY+ HOTSTAR", "SONY LIV", "ZEE5", "ASIANET", "CRAYONS LOOP"].map((brand) => (
              <span key={brand} className="text-lg md:text-xl font-black text-slate-300 tracking-wider hover:text-cyan-400 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 6 Role Workspace Portals Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase text-cyan-400 tracking-widest block">Enterprise Ecosystem</span>
          <h2 className="text-3xl lg:text-5xl font-black text-white">6 Specialized B2B Workspace Portals</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium">Select a role to preview tailored workflows, financial ledgers, and rights governance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: "creator", icon: "🎬", name: "Creator Workspace", desc: "S3 Presigned uploads, metadata intake, promo boost.", btn: "Open Creator Vault" },
            { role: "studio_producer", icon: "🏢", name: "Studio Producer Slate", desc: "ProRes 4K RAW vault, censor certificates, payouts.", btn: "Manage Studio Slate" },
            { role: "global_buyer", icon: "🌐", name: "Global Buyer Marketplace", desc: "Forensic watermarked screeners, escrow deal room.", btn: "Enter Buyer Market" },
            { role: "investor", icon: "📈", name: "Investor Workspace", desc: "Portfolio earnings, transparent studio audit logs.", btn: "View Yield Analytics" },
            { role: "consumer", icon: "📺", name: "Consumer OTT (Loop)", desc: "Crayons Loop OTT stream preview for SVOD/TVOD.", btn: "Launch Stream Player" },
            { role: "admin_os", icon: "🛡️", name: "Super Admin OS", desc: "Legal clearance, technical QC reports, financial payouts.", btn: "Access Admin OS" }
          ].map((w) => (
            <div 
              key={w.role} 
              onClick={() => navigate(`/workspace?role=${w.role}`)}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-8 space-y-4 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {w.icon}
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">{w.name}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{w.desc}</p>
              <button className="w-full text-xs font-black bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {w.btn} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured B2B Film Catalogue Showcase */}
      <section className="py-20 bg-slate-900/60 border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase text-cyan-400 tracking-widest block">Rights-Cleared Catalogue</span>
              <h2 className="text-3xl lg:text-4xl font-black text-white mt-1">Featured B2B Titles Slate</h2>
            </div>
            <button onClick={() => navigate("/workspace?role=global_buyer")} className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-6 py-3 rounded-xl border border-slate-700 cursor-pointer">
              Browse All B2B Catalogues ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {catalogMovies.map((movie) => (
              <div key={movie.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 hover:border-cyan-500/40 transition-all">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img src={movie.poster} alt={movie.title} loading="lazy" decoding="async" className="w-full h-full object-cover will-change-transform" />
                  <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-700 px-3 py-1 rounded-full text-[11px] font-black text-emerald-400 font-mono">
                    {movie.dealValue}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">{movie.type} • {movie.language}</span>
                  <h3 className="text-xl font-black text-white">{movie.title}</h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2">{movie.synopsis}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {movie.rights.map(r => (
                      <span key={r} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                        {r}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setSelectedMovie(movie)} className="w-full mt-4 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 font-black text-xs transition-all cursor-pointer">
                    View Details & Screener 🎬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer Shield */}
      <footer className="bg-slate-950 border-t border-slate-800 px-6 lg:px-12 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-extrabold text-white text-base block">StreamVista Cloud X • Crayons Bridge</span>
            <span className="text-[11px] text-slate-400 mt-1 block">STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-1">
              NON-SUBLICENSABLE GOVERNANCE MANDATE ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-6 font-bold text-slate-300">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=creator")}>Creator Vault</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=global_buyer")}>Buyer Portal</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=admin_os")}>Admin OS</span>
          </div>
        </div>
      </footer>

      {/* Detail Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative">
            <button onClick={() => setSelectedMovie(null)} className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors">
              <X size={18} />
            </button>

            <div>
              <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">{selectedMovie.type} • {selectedMovie.language}</span>
              <h3 className="text-2xl font-black text-white mt-1">{selectedMovie.title}</h3>
              <span className="text-xs text-slate-400 font-bold block mt-0.5">Director: {selectedMovie.director} ({selectedMovie.year})</span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedMovie.synopsis}</p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Target Licensing Fee:</span>
              <span className="text-emerald-400 font-mono text-base">{selectedMovie.dealValue}</span>
            </div>

            <button onClick={() => { setSelectedMovie(null); navigate("/workspace?role=global_buyer"); }} className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 cursor-pointer">
              Open Watermarked Screener Player & Lock Escrow 🔒
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
