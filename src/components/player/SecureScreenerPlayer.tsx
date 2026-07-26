import React, { useState, useEffect, useRef } from "react";
import { Shield, AlertOctagon, Lock } from "lucide-react";

interface SecureScreenerPlayerProps {
  videoSrc: string;
  posterSrc?: string;
  userEmail?: string;
  userIp?: string;
  filmTitle?: string;
}

export function SecureScreenerPlayer({
  videoSrc,
  posterSrc,
  userEmail = "buyer.licensing@amazon.com",
  userIp = "103.22.14.88",
  filmTitle = "Jananam 1947 Pranayam Thudarunnu"
}: SecureScreenerPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Floating Watermark position state (Percentage based X, Y)
  const [watermarkPos, setWatermarkPos] = useState({ top: "25%", left: "30%" });
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());

  // 1. Dynamic Watermark Motion Timer (Moves position every 5 seconds)
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65 + 15) + "%";
      const randomLeft = Math.floor(Math.random() * 55 + 15) + "%";
      setWatermarkPos({ top: randomTop, left: randomLeft });
      setTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19));
    }, 5000);

    return () => clearInterval(moveInterval);
  }, []);

  // 2. Anti-Piracy Security Shield: Suppress ContextMenu, DevTools, PrintScreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Suppress Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("⚠️ Right-Click Disabled: Forensic Watermarked Screener (Non-Sublicensable).");
    };

    // Suppress Key Combinations (F12, Ctrl+Shift+I, PrintScreen, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S")) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        alert("⚠️ Action Restricted: PrintScreen & DevTools shortcuts are disabled for secure screeners.");
      }
    };

    container.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none font-sans"
    >
      {/* HTML5 Secure Video Tag */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        controls
        controlsList="nodownload no-remote-playback"
        disablePictureInPicture
        className="w-full h-full object-cover"
      >
        Your browser does not support HTML5 secure video.
      </video>

      {/* Floating Dynamic Forensic Watermark Overlay */}
      <div 
        className="absolute pointer-events-none transition-all duration-1000 ease-in-out z-30"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        <div className="bg-black/65 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-4 py-2.5 shadow-2xl space-y-0.5 text-[11px] text-white font-mono opacity-85">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400">
            <Shield size={13} /> STREAMVISTA WATERMARK
          </div>
          <div className="font-bold">{userEmail}</div>
          <div className="text-[10px] text-slate-300">IP: {userIp} • {timestamp}</div>
          <div className="text-[9px] font-black text-amber-400 uppercase tracking-tight flex items-center gap-1 pt-0.5 border-t border-slate-700/60 mt-1">
            <Lock size={10} /> NON-SUBLICENSABLE & NON-TRANSFERABLE
          </div>
        </div>
      </div>

      {/* Top Fixed Security Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Forensic Screener Active ({filmTitle})</span>
      </div>
    </div>
  );
}
