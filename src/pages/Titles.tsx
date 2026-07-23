import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Film, Search, Filter, Loader2, Plus } from "lucide-react";
import type { Title } from "../types/title";
import { databaseService } from "../services/database";
import { TitleDetails } from "../components/TitleDetails";
import { useAuth } from "../contexts/AuthContext";

export default function Titles() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingTitle, setViewingTitle] = useState<Title | null>(null);

  const isCreatorOrAdmin = user?.role === "creator_partner" || user?.role === "admin";

  useEffect(() => {
    async function fetchTitles() {
      try {
        const data = await databaseService.getTitles();
        setTitles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTitles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Title Management</h1>
          <p className="text-slate-400">View and manage all active films in the catalog.</p>
        </div>
        {isCreatorOrAdmin && (
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={16} /> Add Title
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Search titles..." className="pl-10" />
        </div>
        <Button variant="secondary" className="flex items-center gap-2">
          <Filter size={16} /> Filter
        </Button>
      </div>

      <Card className="bg-brand-navy-light/40 border-brand-navy-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-black/40 text-xs uppercase text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-brand-gold" />
                    Loading titles...
                  </td>
                </tr>
              ) : titles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Film className="mx-auto h-8 w-8 text-slate-600 mb-3" />
                    <p className="text-slate-400">No titles found in the catalog.</p>
                  </td>
                </tr>
              ) : (
                titles.map((title) => (
                  <tr key={title.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setViewingTitle(title)}>
                    <td className="px-6 py-4 font-medium text-white">{title.title}</td>
                    <td className="px-6 py-4">{title.contentType || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {title.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" className="px-3 py-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); setViewingTitle(title); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {viewingTitle && (
        <TitleDetails title={viewingTitle} onClose={() => setViewingTitle(null)} />
      )}
    </div>
  );
}
