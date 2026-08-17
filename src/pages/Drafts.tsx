import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit3, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createTitleDraft, listCreatorTitles, type MarketplaceTitle } from "../services/marketplace";

const ADMIN_ROLES = new Set(["platform_owner", "founder", "super_admin", "admin"]);

export default function Drafts() {
  const { user, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState<MarketplaceTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [price, setPrice] = useState("0");

  async function refresh() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const titles = await listCreatorTitles(user.uid);
      setDrafts(titles.filter((item) => item.status === "draft"));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load drafts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) void refresh();
  }, [authLoading, user]);

  async function submitDraft(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createTitleDraft(user.uid, {
        title: title.trim(),
        synopsis: synopsis.trim(),
        trailer_url: "",
        film_path: "",
        language: language.trim(),
        price: Number(price) || 0,
        rights: { territory: "", duration: "" },
        workflow_version: "b2b-final-v1",
      });
      setTitle("");
      setLanguage("");
      setSynopsis("");
      setPrice("0");
      setShowCreate(false);
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create draft.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-gold h-8 w-8" /></div>;
  if (!user) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">Sign in is required to access drafts.</div>;
  if (!ADMIN_ROLES.has(user.role) && user.role !== "creator_partner") return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">Your authenticated role does not have access to drafts.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Drafts</h1>
          <p className="text-slate-400">Real StreamVista title drafts from the authenticated workspace.</p>
        </div>
        <Button type="button" onClick={() => setShowCreate((open) => !open)} className="flex items-center gap-2">
          <Plus size={16} /> {showCreate ? "Close" : "New Draft"}
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200" role="alert">{error}</div>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create a real title draft</CardTitle><CardDescription>This writes directly to the authenticated StreamVista title service and remains subject to RLS.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submitDraft} className="grid gap-4 md:grid-cols-2">
              <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title name" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
              <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="Primary language" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
              <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" placeholder="Commercial price" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none" />
              <textarea value={synopsis} onChange={(event) => setSynopsis(event.target.value)} placeholder="Synopsis" className="min-h-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none md:col-span-2" />
              <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create Draft"}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {drafts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-4"><Edit3 size={32} /></div>
            <h3 className="text-xl font-medium text-white mb-2">No active drafts</h3>
            <p className="text-slate-400 mb-6 max-w-md">There are no draft titles visible to this authenticated user yet.</p>
            <Button type="button" onClick={() => setShowCreate(true)}>Start a New Draft</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardHeader><CardTitle className="line-clamp-1">{draft.payload.title || "Untitled"}</CardTitle><CardDescription className="line-clamp-3">{draft.payload.synopsis || "No synopsis added yet."}</CardDescription></CardHeader>
              <CardContent className="space-y-3"><div className="flex flex-wrap gap-2"><Badge variant="outline">{draft.payload.language || "Language not set"}</Badge><Badge variant="outline">Draft</Badge></div><Link to="/uploads" className="inline-flex rounded-lg bg-brand-gold px-3 py-2 text-sm font-bold text-black">Continue to Uploads</Link></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
