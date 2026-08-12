import { Link } from "react-router-dom";
import { BarChart3, Film, Scale, ShieldCheck, UploadCloud, Users, WalletCards } from "lucide-react";

type WorkspaceType = "creator" | "buyer" | "studio";

const config = {
  creator: {
    title: "Creator Workspace",
    subtitle: "My titles, drafts, uploads and screenings.",
    cards: [
      ["My Titles", "21", "/titles", Film],
      ["My Drafts", "139", "/drafts", Film],
      ["Pending Screenings", "34", "/screenings", BarChart3],
      ["Upload", "Add content", "/uploads", UploadCloud],
    ],
  },
  buyer: {
    title: "Buyer Workspace",
    subtitle: "Discovery, screenings and licensing activity.",
    cards: [
      ["Discovery", "Browse titles", "/titles", Film],
      ["Screenings", "34 pending", "/screenings", BarChart3],
      ["Licensing", "Rights-first", "/screenings", Scale],
      ["Campaigns", "Buyer outreach", "/campaigns", Users],
    ],
  },
  studio: {
    title: "Studio Workspace",
    subtitle: "Production, QC, legal and finance operations.",
    cards: [
      ["Production", "21 titles", "/titles", Film],
      ["QC Review", "Review queue", "/qc", ShieldCheck],
      ["Legal", "Rights checks", "/legal", Scale],
      ["Payments", "Revenue", "/finance", WalletCards],
    ],
  },
} as const;

export default function WorkspaceLanding({ type }: { type: WorkspaceType }) {
  const workspace = config[type];
  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow">StreamVista workspace</p>
        <h1 className="display-title mt-2">{workspace.title}</h1>
        <p className="mt-2 text-slate-500">{workspace.subtitle}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {workspace.cards.map(([label, value, path, Icon]) => (
          <Link key={label} to={path} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon size={18} /></div>
            <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
