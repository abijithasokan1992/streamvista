import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Plus, Edit3, RefreshCw } from "lucide-react";
import { assertSupabaseConfigured, supabase } from "../services/supabase";

type LegacyDraft = {
  legacy_draft_id: string;
  title: string;
  content_type: string | null;
  language: string | null;
  country: string | null;
  producer: string | null;
  director: string | null;
  current_tab: string | null;
  rights_available: boolean | null;
  distribution_territories: string | null;
  legacy_updated_at: string | null;
};

export default function Drafts() {
  const [searchParams] = useSearchParams();
  const requestedDraftId = searchParams.get("draft");
  const [drafts, setDrafts] = useState<LegacyDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      assertSupabaseConfigured();

      // Reuse the existing recovery function. It only claims an active legacy
      // account when the signed-in email matches exactly; otherwise it returns
      // a safe no-match result.
      const { error: claimError } = await supabase.rpc("claim_legacy_account");
      if (claimError) throw new Error(claimError.message);

      const { data, error: draftsError } = await supabase.rpc("sv_my_legacy_drafts");
      if (draftsError) throw new Error(draftsError.message);
      setDrafts((data || []) as LegacyDraft[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load recovered drafts.");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const orderedDrafts = useMemo(() => {
    if (!requestedDraftId) return drafts;
    return [...drafts].sort((a, b) => {
      if (a.legacy_draft_id === requestedDraftId) return -1;
      if (b.legacy_draft_id === requestedDraftId) return 1;
      return 0;
    });
  }, [drafts, requestedDraftId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Creator recovery</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your drafts</h1>
          <p className="text-slate-500">Continue the titles already associated with your verified email.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw size={16} className={loading ? "mr-2 animate-spin" : "mr-2"} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={16} /> New Draft
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 text-sm text-amber-900">
            Draft recovery is not available in this environment yet. {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading your recovered drafts…</CardContent>
        </Card>
      ) : orderedDrafts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Edit3 size={32} />
            </div>
            <h3 className="mb-2 text-xl font-medium text-slate-950">No recovered drafts found</h3>
            <p className="mb-6 max-w-md text-slate-500">
              If you previously used StreamVista with a different email address, contact support so ownership can be verified safely.
            </p>
            <Button>Start a New Draft</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orderedDrafts.map((draft) => {
            const isRequested = draft.legacy_draft_id === requestedDraftId;
            return (
              <Card key={draft.legacy_draft_id} className={isRequested ? "ring-2 ring-violet-500" : undefined}>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge>{draft.content_type || "Draft"}</Badge>
                    {draft.current_tab && <Badge variant="secondary">Continue: {draft.current_tab}</Badge>}
                    {isRequested && <Badge variant="secondary">Opened from your email</Badge>}
                  </div>
                  <CardTitle>{draft.title || "Untitled draft"}</CardTitle>
                  <CardDescription>
                    {[draft.language, draft.country].filter(Boolean).join(" · ") || "Legacy StreamVista draft"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  {draft.director && <p><span className="font-medium text-slate-900">Director:</span> {draft.director}</p>}
                  {draft.producer && <p><span className="font-medium text-slate-900">Producer:</span> {draft.producer}</p>}
                  {draft.distribution_territories && <p><span className="font-medium text-slate-900">Territories:</span> {draft.distribution_territories}</p>}
                  {draft.legacy_updated_at && (
                    <p className="text-xs text-slate-400">Last saved {new Date(draft.legacy_updated_at).toLocaleDateString()}</p>
                  )}
                  <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                    Recovered read-only record. Editing will be enabled only after the legacy-to-current draft migration is verified.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
