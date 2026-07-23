import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CheckCircle, XCircle, Search, PlayCircle } from "lucide-react";
import { Input } from "../components/ui/Input";
import type { Title } from "../types/title";
import { databaseService } from "../services/database";

export default function QC() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingQC() {
      try {
        const data = await databaseService.getTitles();
        setTitles(data.filter(t => t.qcStatus === "pending"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingQC();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await databaseService.updateQCStatus(id, action === 'approve' ? 'approved' : 'rejected');
      setTitles(prev => prev.filter(t => t.id !== id));
      alert(`Title QC status updated to ${action}.`);
    } catch (e) {
      alert("Failed to update QC status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Quality Control</h1>
        <p className="text-slate-400">Review master files, subtitles, and metadata before publishing.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Search titles pending QC..." className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading QC Queue...</div>
      ) : titles.length === 0 ? (
        <Card className="bg-brand-navy-light/40 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={40} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Queue is Empty</h3>
            <p className="text-slate-400">All submitted titles have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {titles.map(title => (
            <Card key={title.id} className="bg-brand-navy-light/40 border-brand-navy-light flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-48 bg-black relative flex items-center justify-center border-r border-white/5">
                {title.posterUrl ? (
                   <img src={title.posterUrl} className="w-full h-full object-cover opacity-70" alt="poster" />
                ) : (
                   <span className="text-xs text-slate-500">No Asset</span>
                )}
                <PlayCircle className="absolute text-white/80 h-10 w-10 hover:text-brand-gold cursor-pointer transition-colors" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{title.title}</CardTitle>
                    <span className="px-2 py-1 bg-brand-orange/20 text-brand-orange text-xs font-bold rounded uppercase">
                      QC Pending
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{title.synopsis}</p>
                  
                  <div className="flex gap-6 text-sm text-slate-300">
                    <div><span className="text-slate-500">Specs:</span> {title.contentType} • {title.runtimeMinutes}m</div>
                    <div><span className="text-slate-500">Subtitles:</span> {title.subtitleFiles?.length || 0}</div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                  <Button variant="secondary" onClick={() => handleAction(title.id, 'reject')} className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                  <Button variant="primary" onClick={() => handleAction(title.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                    <CheckCircle size={16} className="mr-2" /> Approve Media
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
