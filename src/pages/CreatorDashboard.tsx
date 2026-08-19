import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clapperboard,
  FileEdit,
  Film,
  FolderOpen,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const stageLinks = [
  { label: "Titles", description: "Manage your projects", href: "/titles", icon: Clapperboard },
  { label: "Drafts", description: "Develop unpublished work", href: "/drafts", icon: FileEdit },
  { label: "Uploads", description: "Deliver posters and masters", href: "/uploads", icon: Upload },
  { label: "Screenings", description: "Manage buyer access", href: "/screenings", icon: Film },
  { label: "Analytics", description: "Track title performance", href: "/analytics", icon: BarChart3 },
];

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await databaseService.getTitlesByCreator(user.uid);
        if (active) setTitles(data);
      } catch {
        if (active) setTitles([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const activeTitles = titles.filter((title) => title.status !== "archived").length;
    const readyForQc = titles.filter((title) => title.qcStatus === "approved").length;
    const inProgress = titles.filter((title) => title.status === "draft" || title.status === "pending").length;
    return { total: titles.length, activeTitles, readyForQc, inProgress };
  }, [titles]);

  return (
    <div className="space-y-8 pb-8">
      <section className="overflow-hidden rounded-3xl bg-[#150b20] p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FFC700]">
              <span className="h-2 w-2 rounded-full bg-[#FFC700]" /> Creator Workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Welcome, {user?.displayName || "Creator"}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 md:text-base">
              Move your titles from development to delivery with one creator-focused workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/titles"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFC700] px-4 py-3 text-sm font-bold text-black transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" /> New title
            </Link>
            <Link
              to="/uploads"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <Upload className="h-4 w-4" /> Upload asset
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "My titles", value: stats.total, icon: FolderOpen },
          { label: "Active", value: stats.activeTitles, icon: Clapperboard },
          { label: "In progress", value: stats.inProgress, icon: FileEdit },
          { label: "QC approved", value: stats.readyForQc, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Creator workflow</h2>
          <p className="mt-1 text-sm text-slate-500">Everything you need to move a title forward.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stageLinks.map(({ label, description, href, icon: Icon }) => (
            <Link key={href} to={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
              </div>
              <p className="font-bold text-slate-900">{label}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My titles</h2>
            <p className="mt-1 text-sm text-slate-500">Your creator-scoped catalogue.</p>
          </div>
          <Link to="/titles" className="text-sm font-bold text-violet-700 hover:underline">View all</Link>
        </div>

        {loading ? (
          <Card className="border-slate-200 shadow-none">
            <CardContent className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            </CardContent>
          </Card>
        ) : titles.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500">
                <Clapperboard className="h-7 w-7" />
              </div>
              <p className="font-bold text-slate-900">Your creator catalogue is empty</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">Create your first title and then continue through metadata, artwork, assets, QC and delivery.</p>
              <Link to="/titles" className="mt-5 rounded-xl bg-[#FFC700] px-4 py-2.5 text-sm font-bold text-black">Create first title</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {titles.slice(0, 6).map((title) => (
              <Card key={title.id} className="border-slate-200 shadow-none">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <Badge variant="outline">{title.contentType}</Badge>
                    <Badge variant="success">{title.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{title.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{title.synopsis || "No synopsis added yet."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="text-slate-500">QC status</span>
                    <span className="font-semibold capitalize text-slate-800">{title.qcStatus || "pending"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link to="/titles" className="text-sm font-bold text-violet-700 hover:underline">Manage title →</Link>
                    <Link to="/uploads" className="text-sm font-bold text-slate-700 hover:underline">Upload assets →</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
