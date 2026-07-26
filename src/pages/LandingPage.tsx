import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  ArrowRight,
  X,
  ShieldCheck,
  Film,
  DollarSign,
  Lock,
  Sparkles
} from "lucide-react";
import { LiveActivityTickerBar } from "../components/LiveActivityTickerBar";
import { StakeholderHubSection } from "../components/stakeholders/StakeholderHubSection";

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
      director: "Abijith Asokan",
      cast: "Jayaraj Kozhikode, Leela Samson, Anu Sithara",
      posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "Crayons Bridge Global Distribution Engine",
      subtitle: "Direct B2B licensing pipeline connecting creators with global OTT aggregators and broadcast networks.",
      tag: "Enterprise Marketplace",
      badge: "7 Buyer Networks Active",
      director: "Crayons Pictures Union",
      cast: "Worldwide Content Creators",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200&auto=format&fit=crop"
    },
    {
      title: "StreamVista Cloud Studio OS & B2B Escrow",
      subtitle: "Direct AWS S3 multipart ingestion, non-sublicensable legal governance, and instant escrow dispatches.",
      tag: "Studio OS & Financials",
      badge: "10/90 & 50/50 Split Engine",
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
      rights: ["Worldwide OTT", "Digital Rights"],
      dealValue: "$25,000 USD"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 0. Live Activity Ticker Bar */}
      <LiveActivityTickerBar />

      {/* 1. Sleek Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#090D16]/95 backdrop-blur-xl border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
            SV
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              StreamVista <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Cloud X</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">STREAMVISTA OPC PVT LTD • Crayons Bridge</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/workspace?role=creator")}
            className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer hidden sm:flex items-center gap-2"
          >
            <Lock size={14} className="text-amber-400" /> B2B Portal Login
          </button>
          
          <button 
            onClick={() => navigate("/workspace")}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Launch Workspace OS</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* 2. Hero Cinematic Carousel Banner */}
      <section className="relative overflow-hidden bg-[#090D16] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase">
              {slides[currentSlide].tag} • {slides[currentSlide].badge}
            </div>

            <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">
              {slides[currentSlide].title}
            </h1>

            <p className="text-sm lg:text-base text-slate-300 font-medium leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/workspace?role=global_buyer")}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-7 py-3.5 rounded-xl flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <Play size={16} fill="currentColor" /> Explore B2B Screener Player
              </button>
              
              <button
                onClick={() => navigate("/workspace?role=creator")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs px-7 py-3.5 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-2"
              >
                <Film size={16} className="text-amber-400" /> Producer RAW Vault
              </button>
            </div>

            <div className="flex items-center gap-5 pt-3 text-xs font-medium text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-amber-400" /> Non-Sublicensable Mandate</span>
              <span className="flex items-center gap-1.5"><DollarSign size={16} className="text-amber-400" /> 10/90 & 50/50 Revenue Split</span>
            </div>
          </div>

          {/* Right Movie Poster Card */}
          <div className="relative group cursor-pointer" onClick={() => navigate("/workspace?role=global_buyer")}>
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl aspect-video bg-slate-900">
              <img 
                src={slides[currentSlide].posterUrl} 
                alt={slides[currentSlide].title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Director: {slides[currentSlide].director}</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{slides[currentSlide].title}</h3>
                <span className="text-xs text-slate-300 font-medium mt-0.5">Cast: {slides[currentSlide].cast}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Indicators */}
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pb-6 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? "w-10 bg-amber-400" : "w-2.5 bg-slate-800 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </section>

      {/* 3. Global Buyer Network Showcase */}
      <section className="py-10 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-4 text-center">
          <span className="text-[11px] font-bold uppercase text-amber-400 tracking-widest block">
            Trusted Distribution Buyer Network
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80">
            {["NETFLIX", "PRIME VIDEO", "DISNEY+ HOTSTAR", "SONY LIV", "ZEE5", "ASIANET", "CRAYONS LOOP"].map((brand) => (
              <span key={brand} className="text-base md:text-lg font-extrabold text-slate-300 tracking-wider hover:text-amber-400 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 6 Stakeholder Dedicated Entrance Hub */}
      <StakeholderHubSection />

      {/* 5. Featured B2B Film Catalogue Showcase */}
      <section className="py-16 bg-slate-900/40 border-t border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-400 tracking-widest block">Rights-Cleared Catalog</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Featured B2B Titles Slate</h2>
            </div>
            <button onClick={() => navigate("/workspace?role=global_buyer")} className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-800 cursor-pointer">
              Browse All Catalogues ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {catalogMovies.map((movie) => (
              <div key={movie.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-3 hover:border-amber-500/40 transition-all">
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img src={movie.poster} alt={movie.title} loading="lazy" decoding="async" className="w-full h-full object-cover will-change-transform" />
                  <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-700 px-2.5 py-1 rounded-md text-[11px] font-extrabold text-amber-400 font-mono">
                    {movie.dealValue}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider block">{movie.type} • {movie.language}</span>
                  <h3 className="text-lg font-extrabold text-white">{movie.title}</h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{movie.synopsis}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {movie.rights.map(r => (
                      <span key={r} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                        {r}
                      </span>
                    ))}
                  </div>

                  <button onClick={() => setSelectedMovie(movie)} className="w-full mt-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer">
                    View Details & Screener 🎬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Sleek Footer Shield */}
      <footer className="bg-[#090D16] border-t border-slate-800/80 px-6 lg:px-12 py-10 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-extrabold text-white text-sm block">StreamVista Cloud X • Crayons Bridge</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union</span>
            <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
              NON-SUBLICENSABLE GOVERNANCE MANDATE ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-5 font-semibold text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=creator")}>Creator Vault</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=global_buyer")}>Buyer Portal</span>
            <span className="hover:text-white cursor-pointer" onClick={() => navigate("/workspace?role=admin_os")}>Admin OS</span>
          </div>
        </div>
      </footer>

      {/* Detail Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-[#090D16]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setSelectedMovie(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors">
              <X size={16} />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">{selectedMovie.type} • {selectedMovie.language}</span>
              <h3 className="text-xl font-extrabold text-white mt-0.5">{selectedMovie.title}</h3>
              <span className="text-xs text-slate-400 font-semibold block mt-0.5">Director: {selectedMovie.director} ({selectedMovie.year})</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedMovie.synopsis}</p>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Target Licensing Fee:</span>
              <span className="text-amber-400 font-mono text-sm">{selectedMovie.dealValue}</span>
            </div>

            <button onClick={() => { setSelectedMovie(null); navigate("/workspace?role=global_buyer"); }} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md cursor-pointer">
              Open Watermarked Screener Player & Lock Escrow 🔒
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
