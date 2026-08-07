import { Bot, BriefcaseBusiness, HeartPulse, Search, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { label: "Upload a film", path: "/creator", icon: Upload },
  { label: "License content", path: "/buyer", icon: Search },
  { label: "Check my deals", path: "/workspace", icon: BriefcaseBusiness },
  { label: "View platform health", path: "/chief-ai-operator", icon: HeartPulse },
  { label: "AI Workspace", path: "/chief-ai-operator", icon: Bot },
];

export function CommandBar() {
  const navigate = useNavigate();
  return (
    <div className="border-b border-white/10 bg-black/20 px-4 py-3 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto">
        <span className="shrink-0 text-xs font-semibold text-slate-500">What do you want to do today?</span>
        {actions.map((action) => (
          <button key={action.label} onClick={() => navigate(action.path)} className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-400/30 hover:text-white">
            <action.icon size={14} className="text-amber-300" /> {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
