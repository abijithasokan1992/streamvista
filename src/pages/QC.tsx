import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CheckCircle, XCircle, Search, PlayCircle, ShieldCheck, FileText, Activity } from "lucide-react";
import { Input } from "../components/ui/Input";
import type { Title } from "../types/title";
import { databaseService } from "../services/database";
import { useAuth } from "../contexts/AuthContext";

export default function QC() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleQCAction = async (title: Title, action: 'pass_to_legal' | 'reject') => {
    setProcessingId(title.id);
    try {
      const qcNote = notes[title.id] || (action === 'pass_to_legal' ? 'Technical QC passed: HLS master and metadata verified.' : 'Technical QC failed: Video or audio specifications non-compliant.');
      
      const newQCStatus = action === 'pass_to_legal' ? 'approved' : 'rejected';

      await databaseService.updateQCStatus(title.id, newQCStatus);

      if (databaseService.isSupabase()) {
        await databaseService.supabase.logAuditAction(
          user?.uid || 'system',
          action === 'pass_to_legal' ? 'QC_PASSED_SENT_TO_LEGAL' : 'QC_REJECTED',
          'title',
          title.id,
          { reviewer: user?.email, notes: qcNote, timestamp: new Date().toISOString() }
        );
      }

      setTitles(prev => prev.filter(t => t.id !== title.id));
      alert(action === 'pass_to_legal' ? `Title "${title.title}" passed Technical QC and sent to Legal Review!` : `Title "${title.title}" rejected and returned to Creator.`);
    } catch (e) {
      console.error(e);
      alert("Failed to execute QC workflow transition.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <ShieldCheck className="text-brand-gold h-8 w-8" /> Technical QC Desk
          </h1>
          <p className="text-slate-400 text-sm">Review 4K/HLS master streams, audio sync, and sub-master compliance.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-navy-light/60 px-4 py-2 rounded-lg border border-brand-gold/20">
          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">QC Automated Pre-flight Active</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input placeholder="Search pending QC queue..." className="pl-10 bg-brand-navy-light/40 border-white/10" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading QC Inspection Queue...</div>
      ) : titles.length === 0 ? (
        <Card className="bg-brand-navy-light/40 border-dashed border-2 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Technical QC Queue Clean</h3>
            <p className="text-slate-400 text-sm">All submitted master assets have passed inspection and proceeded to Legal Clearance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {titles.map(title => (
            <Card key={title.id} className="bg-brand-navy-light/40 border border-white/10 flex flex-col md:flex-row overflow-hidden hover:border-brand-gold/30 transition-all">
              <div className="w-full md:w-56 bg-black relative flex items-center justify-center border-r border-white/10 group">
                {title.posterUrl ? (
                  <img src={title.posterUrl} className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity" alt="poster" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-6 text-center">
                    <FileText className="h-10 w-10 text-slate-600" />
                    <span className="text-xs text-slate-500 font-mono">NO MASTER PREVIEW</span>
                  </div>
                )}
                <PlayCircle className="absolute text-white/90 h-12 w-12 hover:text-brand-gold cursor-pointer transition-colors shadow-2xl" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-2xl text-white font-bold">{title.title}</CardTitle>
                      <span className="text-xs text-slate-400">Submitted by {title.creatorOwnerId || 'Creator Studio'}</span>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
                      QC Pending
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">{title.synopsis || "No synopsis metadata attached."}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-brand-black/40 rounded-lg border border-white/5 text-xs text-slate-300 mb-4">
                    <div><span className="text-slate-500 block">Genres:</span> {title.genres?.join(', ') || 'Feature'}</div>
                    <div><span className="text-slate-500 block">Runtime:</span> {title.runtimeMinutes || 90}m</div>
                    <div><span className="text-slate-500 block">Subtitles:</span> {title.subtitleFiles?.length || 1} File(s)</div>
                    <div><span className="text-slate-500 block">Audio Specs:</span> 5.1 Surround / Stereo</div>
                  </div>

                  <div className="mt-2">
                    <label className="text-xs text-slate-400 mb-1 block">QC Inspection Notes:</label>
                    <input 
                      type="text" 
                      placeholder="Add technical comments or compliance notes..." 
                      value={notes[title.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [title.id]: e.target.value }))}
                      className="w-full bg-brand-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <Button 
                    variant="secondary" 
                    disabled={processingId === title.id}
                    onClick={() => handleQCAction(title, 'reject')} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/30 text-xs"
                  >
                    <XCircle size={14} className="mr-1.5" /> Reject & Return to Creator
                  </Button>

                  <Button 
                    variant="primary" 
                    disabled={processingId === title.id}
                    onClick={() => handleQCAction(title, 'pass_to_legal')} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold border-none text-xs px-4"
                  >
                    <CheckCircle size={14} className="mr-1.5" /> Pass QC & Send to Legal
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
