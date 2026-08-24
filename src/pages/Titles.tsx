import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { databaseService } from "../services/database";
import { Title } from "../types/title";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission } from "../security/rbac";

export default function Titles() {
  const { user, loading: authLoading } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (authLoading || !user || !hasPermission(user.role, "titles.read")) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await databaseService.getTitles();
        if (!cancelled) setTitles(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load titles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  const filteredTitles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return titles;
    return titles.filter((title) => `${title.title} ${title.synopsis} ${title.contentType} ${title.status}`.toLowerCase().includes(normalized));
  }, [query, titles]);

  if (authLoading || loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-gold h-8 w-8" /></div>;
  if (!user || !hasPermission(user.role, "titles.read")) return <div className="space-y-4"><h1 className="text-3xl font-bold tracking-tight text-white">Unauthorized</h1><p className="text-slate-400">Your authenticated role does not have permission to read titles.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight text-white mb-2">Titles</h1><p className="text-slate-400">Real StreamVista titles visible to your authenticated role.</p></div>
        <Link to="/drafts"><Button className="flex items-center gap-2"><Plus size={16} /> Add Title</Button></Link>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles..." className="pl-10" aria-label="Search titles" /></div>

      {error ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200" role="alert">{error}</div> : filteredTitles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center"><h2 className="text-lg font-semibold text-white">{query ? "No matching titles" : "No titles yet"}</h2><p className="mt-2 text-sm text-slate-400">{query ? "Try a different title, synopsis, type, or status." : "Create a real draft to begin the StreamVista title workflow."}</p>{!query && <Link to="/drafts" className="mt-5 inline-flex rounded-lg bg-brand-gold px-4 py-2 text-sm font-bold text-black">Create Draft</Link>}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTitles.map((title) => (
            <Card key={title.id} className="flex flex-col hover:border-brand-gold/50 transition-colors">
              <div className="aspect-[2/3] bg-brand-navy border-b border-white/5 relative overflow-hidden flex items-center justify-center">
                {title.posterUrl ? <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" /> : <span className="text-slate-600 font-medium">Poster not uploaded</span>}
              </div>
              <CardHeader className="flex-1 pb-4"><CardTitle className="line-clamp-1">{title.title}</CardTitle><CardDescription className="line-clamp-2 mt-1">{title.synopsis}</CardDescription></CardHeader>
              <div className="px-6 pb-4 flex gap-2 flex-wrap"><Badge variant="outline">{title.contentType}</Badge><Badge variant="success">{title.status}</Badge></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
