import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTitlesByStatus, MarketplaceTitle } from "../services/marketplace";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function Marketplace() {
  const [titles, setTitles] = useState<MarketplaceTitle[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { listTitlesByStatus("approved").then(setTitles).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><div><p className="text-sm uppercase tracking-wider text-slate-400">Crayons Bridge</p><h1 className="text-3xl font-bold text-white">Marketplace</h1><p className="mt-2 text-slate-400">Approved titles available for controlled preview and commercial discussion.</p></div>{loading ? <p className="text-slate-400">Loading marketplace…</p> : titles.length === 0 ? <p className="text-slate-400">No approved titles available.</p> : <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{titles.map((title) => <Card key={title.id}><CardHeader><CardTitle>{title.payload.title}</CardTitle><CardDescription className="line-clamp-3">{title.payload.synopsis}</CardDescription></CardHeader><CardContent><p className="mb-4 text-sm text-slate-400">{title.payload.language || "Language not specified"}</p><Link to={`/marketplace/${title.id}/preview`}><Button variant="primary" className="w-full">Preview</Button></Link></CardContent></Card>)}</div>}</div>;
}
