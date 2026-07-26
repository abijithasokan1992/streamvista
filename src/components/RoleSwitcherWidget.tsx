import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRBAC, MOCK_ROLES, MockRole } from "../hooks/useRBAC";
import { Shield, Sparkles, ChevronDown } from "lucide-react";

export function RoleSwitcherWidget() {
  const { activeRole, switchRole } = useRBAC();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Visible ONLY on localhost / dev mode / VITE_USE_MOCK_AUTH=true
  const isLocalOrMock = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    import.meta.env.VITE_USE_MOCK_AUTH === "true" ||
    window.location.search.includes("mockAuth=true")
  );

  if (!isLocalOrMock) return null;

  const currentRoleObj = MOCK_ROLES.find(r => r.id === activeRole) || MOCK_ROLES[5];

  const handleRoleSelect = (roleId: MockRole) => {
    switchRole(roleId);
    setSearchParams({ role: roleId });
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-slate-900/95 hover:bg-slate-900 text-white border border-cyan-500/40 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl transition-all cursor-pointer glow-btn group"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
            <Shield size={18} />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-cyan-400 block">
              Dev Tools • Mock RBAC
            </span>
            <span className="text-xs font-black text-white flex items-center gap-1">
              {currentRoleObj.label} <ChevronDown size={14} className="text-slate-400" />
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-slate-900/95 border border-slate-800 rounded-3xl p-3 shadow-2xl backdrop-blur-xl space-y-1 z-50">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" /> Select Active Role
              </span>
              <span className="text-[10px] text-cyan-400 font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20">
                Synced to URL
              </span>
            </div>

            {MOCK_ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeRole === r.id
                    ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{r.label}</span>
                {activeRole === r.id && <span className="text-[10px] font-black uppercase">Active</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
