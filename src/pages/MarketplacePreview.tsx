import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listTitlesByStatus, MarketplaceTitle } from "../services/marketplace";
import { Button } from "../components/ui/Button";

export default function MarketplacePreview() {
  const { titleId } = useParams<{ titleId: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState<MarketplaceTitle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const approved = await listTitlesByStatus("approved");
        const match = approved.find((item) => item.id === titleId) || null;
        if (active) setTitle(match);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [titleId]);

  if (loading) return <div className="p-8 text-slate-300">Loading preview…</div>;
  if (!title) return <div className="p-8 text-slate-300"><h1 className="text-2xl font-semibold text-white">Preview unavailable</h1><p className="mt-2">This title is not approved for marketplace screening.</p></div>;

  const canEnterDealRoom = user?.role === "buyer" || ["platform_owner", "founder", "super_admin", "admin"].includes(user?.role || "");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wider text-slate-400">Marketplace / Preview</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{title.payload.title}</h1>
        <p className="mt-2 text-slate-300">{title.payload.synopsis}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
        {title.payload.trailer_url ? (
          <video className="aspect-video w-full bg-black" controls src={title.payload.trailer_url} />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-black text-slate-500">Preview media not available</div>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div><p className="text-xs text-slate-500">Language</p><p className="text-white">{title.payload.language || "—"}</p></div>
        <div><p className="text-xs text-slate-500">Territory</p><p className="text-white">{title.payload.rights.territory || "—"}</p></div>
        <div><p className="text-xs text-slate-500">Rights duration</p><p className="text-white">{title.payload.rights.duration || "—"}</p></div>
      </div>
      {canEnterDealRoom && <Link to={`/deal-room/${title.id}`}><Button variant="primary">Open Deal Room</Button></Link>}
    </div>
  );
}
