import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CheckCircle, XCircle, FileSignature, AlertCircle, Scale, Globe } from "lucide-react";
import type { Title } from "../types/title";
import { databaseService } from "../services/database";
import { useAuth } from "../contexts/AuthContext";

export default function Legal() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPendingLegal() {
      try {
        const data = await databaseService.getTitles();
        setTitles(data.filter(t => t.legalStatus === "pending" || t.qcStatus === "approved"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingLegal();
  }, []);

  const handleLegalAction = async (title: Title, action: 'approve_distribution_ready' | 'reject') => {
    setProcessingId(title.id);
    try {
      const legalNote = notes[title.id] || (action === 'approve_distribution_ready' ? 'Legal clearance verified: Chain of Title, E&O insurance, and music rights cleared.' : 'Legal clearance rejected: Chain of title docs incomplete.');

      const newLegalStatus = action === 'approve_distribution_ready' ? 'approved' : 'rejected';

      await databaseService.updateLegalStatus(title.id, newLegalStatus);

      if (databaseService.isSupabase()) {
        await databaseService.supabase.logAuditAction(
          user?.uid || 'system',
          action === 'approve_distribution_ready' ? 'LEGAL_CLEARED_DISTRIBUTION_READY' : 'LEGAL_CLEARANCE_REJECTED',
          'title',
          title.id,
          { attorney: user?.email, notes: legalNote, timestamp: new Date().toISOString() }
        );
      }

      setTitles(prev => prev.filter(t => t.id !== title.id));
      alert(action === 'approve_distribution_ready' ? `Title "${title.title}" cleared by Legal and marked Distribution Ready!` : `Title "${title.title}" rejected and returned to QC Desk.`);
    } catch (e) {
      console.error(e);
      alert("Failed to execute Legal workflow transition.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <Scale className="text-brand-gold h-8 w-8" /> Rights, Legal & Clearance Desk
          </h1>
          <p className="text-slate-400 text-sm">Review Chain of Title documentation, sync licenses, E&O certificates, and territorial rights.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-navy-light/60 px-4 py-2 rounded-lg border border-brand-gold/20">
          <Globe className="h-4 w-4 text-brand-gold" />
          <span className="text-xs font-semibold text-slate-200">Global Clearance Desk Active</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading Legal Review Queue...</div>
      ) : titles.length === 0 ? (
        <Card className="bg-brand-navy-light/40 border-dashed border-2 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Legal Review Queue Clear</h3>
            <p className="text-slate-400 text-sm">All titles have undergone legal clearance and are available for buyer deal mapping.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {titles.map(title => (
            <Card key={title.id} className="bg-brand-navy-light/40 border border-white/10 flex flex-col justify-between hover:border-brand-gold/30 transition-all">
              <div>
                <CardHeader className="pb-3 border-b border-white/10 bg-brand-black/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-white font-bold">{title.title}</CardTitle>
                      <span className="text-xs text-slate-400">Submitted by {title.creatorOwnerId || 'Studio Partner'}</span>
                    </div>
                    <FileSignature className="text-brand-gold h-6 w-6" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-400">Licensing Model:</span>
                    <span className="text-brand-gold font-semibold uppercase text-xs">{title.licensingModel || 'EXCLUSIVE DISTRIBUTION'}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-slate-400">Territories Rights:</span>
                    <span className="text-white text-xs">{title.rightsAvailable?.join(', ') || 'Worldwide (All Regions)'}</span>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    <p>Verification required: Chain of Title, Music Cue Sheet, and E&O Insurance Policy validity.</p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Legal & Rights Notes:</label>
                    <input 
                      type="text" 
                      placeholder="Enter legal clearance notes or rider terms..." 
                      value={notes[title.id] || ''}
                      onChange={(e) => setNotes(prev => ({ ...prev, [title.id]: e.target.value }))}
                      className="w-full bg-brand-black/60 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 border-t border-white/10 mt-4 flex justify-end gap-3">
                <Button 
                  variant="secondary" 
                  disabled={processingId === title.id}
                  onClick={() => handleLegalAction(title, 'reject')} 
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/40 border-red-900/30 text-xs"
                >
                  <XCircle size={14} className="mr-1.5" /> Reject Rights
                </Button>

                <Button 
                  variant="primary" 
                  disabled={processingId === title.id}
                  onClick={() => handleLegalAction(title, 'approve_distribution_ready')} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold border-none text-xs px-4"
                >
                  <CheckCircle size={14} className="mr-1.5" /> Approve & Mark Distribution Ready
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
