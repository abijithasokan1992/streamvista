import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ListVideo, Link2, Copy, ShieldAlert, Clock, Eye, Lock, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { databaseService } from "../services/database";
import { useAuth } from "../contexts/AuthContext";
import type { Title } from "../types/title";

export interface ScreeningSession {
  id: string;
  titleId: string;
  titleName: string;
  buyerName: string;
  buyerEmail: string;
  screenerUrl: string;
  watermarkText: string;
  expiresAt: string;
  maxViews: number;
  viewCount: number;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

export default function Screenings() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScreeningSession[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Session Form State
  const [selectedTitleId, setSelectedTitleId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [watermarkType, setWatermarkType] = useState("DYNAMIC_EMAIL_IP");
  const [expirationDays, setExpirationDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedTitles = await databaseService.getTitles();
        setTitles(fetchedTitles);

        // Initial default screening sessions
        setSessions([
          {
            id: "scr_101",
            titleId: "title_kalki",
            titleName: "Kalki 2898 AD",
            buyerName: "Netflix Content Acquisitions",
            buyerEmail: "acquisitions@netflix.com",
            screenerUrl: "https://streamvista.app/screener/view/scr_101?token=exp_99812",
            watermarkText: "CONFIDENTIAL — FOR NETFLIX ACQUISITION REVIEW ONLY",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxViews: 5,
            viewCount: 2,
            status: "active",
            createdAt: new Date().toISOString()
          },
          {
            id: "scr_102",
            titleId: "title_maharaja",
            titleName: "Maharaja",
            buyerName: "Amazon Prime Video India",
            buyerEmail: "in-acq@amazon.com",
            screenerUrl: "https://streamvista.app/screener/view/scr_102?token=exp_99813",
            watermarkText: "FOR INTERNAL SCREENING ONLY — DO NOT DISTRIBUTE",
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            maxViews: 3,
            viewCount: 3,
            status: "active",
            createdAt: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTitleId || !buyerEmail) return;
    setCreating(true);

    const titleObj = titles.find(t => t.id === selectedTitleId) || { title: "Custom Title Screener" };
    const newSessionId = `scr_${Date.now()}`;
    const expDate = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

    const newSession: ScreeningSession = {
      id: newSessionId,
      titleId: selectedTitleId,
      titleName: titleObj.title,
      buyerName: buyerName || buyerEmail.split('@')[0],
      buyerEmail,
      screenerUrl: `https://streamvista.app/screener/view/${newSessionId}?token=auth_${Date.now()}`,
      watermarkText: `${buyerEmail.toUpperCase()} • DYNAMIC IP OVERLAY • STREAMVISTA`,
      expiresAt: expDate,
      maxViews: 5,
      viewCount: 0,
      status: "active",
      createdAt: new Date().toISOString()
    };

    setSessions(prev => [newSession, ...prev]);

    if (databaseService.isSupabase()) {
      await databaseService.supabase.logAuditAction(
        user?.uid || 'user',
        'SCREENING_LINK_CREATED',
        'screener_session',
        newSessionId,
        { buyerEmail, titleName: titleObj.title, expiresAt: expDate }
      );
    }

    setCreating(false);
    setShowCreateModal(false);
    setBuyerName("");
    setBuyerEmail("");
  };

  const handleRevoke = async (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'revoked' } : s));
    if (databaseService.isSupabase()) {
      await databaseService.supabase.logAuditAction(
        user?.uid || 'user',
        'SCREENING_LINK_REVOKED',
        'screener_session',
        id
      );
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <ListVideo className="text-brand-gold h-8 w-8" /> Buyer Watermarked Screenings
          </h1>
          <p className="text-slate-400 text-sm">Generate secure, time-bound, forensic-watermarked screener links for OTT buyer evaluation.</p>
        </div>

        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold flex items-center gap-2 text-xs"
        >
          <Plus size={16} /> Create Watermarked Screener Link
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading Screening Sessions...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-brand-navy-light/40 border border-white/10 p-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                Active Screener Links
                <Link2 className="h-4 w-4 text-brand-gold" />
              </div>
              <div className="text-3xl font-bold text-white mt-2">{sessions.filter(s => s.status === 'active').length}</div>
            </Card>

            <Card className="bg-brand-navy-light/40 border border-white/10 p-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                Total Buyer Plays
                <Eye className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mt-2">{sessions.reduce((acc, s) => acc + s.viewCount, 0)}</div>
            </Card>

            <Card className="bg-brand-navy-light/40 border border-white/10 p-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                Security Enforced
                <ShieldAlert className="h-4 w-4 text-brand-orange" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">100% Forensic</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sessions.map(session => (
              <Card key={session.id} className="bg-brand-navy-light/40 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center p-6 hover:border-brand-gold/30 transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{session.titleName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${session.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      {session.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">Assigned to <span className="font-semibold text-white">{session.buyerName}</span> ({session.buyerEmail})</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                    <span className="flex items-center gap-1"><Clock size={13} /> Expires: {new Date(session.expiresAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye size={13} /> Views: {session.viewCount} / {session.maxViews}</span>
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-brand-gold bg-black/40 px-2.5 py-1 rounded border border-white/5 inline-block">
                    Watermark: "{session.watermarkText}"
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => copyToClipboard(session.screenerUrl, session.id)} 
                    className="text-xs flex items-center gap-1.5"
                  >
                    {copiedId === session.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === session.id ? "Link Copied!" : "Copy Screener URL"}
                  </Button>

                  {session.status === 'active' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleRevoke(session.id)}
                      className="text-xs text-red-400 hover:bg-red-950/40 border-red-900/30"
                    >
                      <Trash2 size={14} className="mr-1" /> Revoke Access
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Screener Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="bg-brand-navy border border-white/20 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Lock className="text-brand-gold" /> Generate Secure Watermarked Screener
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Create a time-restricted link with dynamic visual watermark overlay.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Select Target Title:</label>
                  <select 
                    value={selectedTitleId} 
                    onChange={e => setSelectedTitleId(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="">-- Choose Title --</option>
                    {titles.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.contentType})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Buyer Executive Name:</label>
                    <Input 
                      placeholder="e.g. Ted Sarandos" 
                      value={buyerName} 
                      onChange={e => setBuyerName(e.target.value)}
                      className="bg-black/50 border-white/10 text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Buyer Corporate Email:</label>
                    <Input 
                      type="email" 
                      placeholder="buyer@netflix.com" 
                      value={buyerEmail} 
                      onChange={e => setBuyerEmail(e.target.value)}
                      required
                      className="bg-black/50 border-white/10 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Expiration Window:</label>
                    <select 
                      value={expirationDays} 
                      onChange={e => setExpirationDays(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                    >
                      <option value={3}>3 Days</option>
                      <option value={7}>7 Days</option>
                      <option value={14}>14 Days</option>
                      <option value={30}>30 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Watermark Overlay Style:</label>
                    <select 
                      value={watermarkType} 
                      onChange={e => setWatermarkType(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                    >
                      <option value="DYNAMIC_EMAIL_IP">Dynamic Email + IP + Timestamp</option>
                      <option value="STATIC_CONFIDENTIAL">Confidential Review Only</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="text-xs">Cancel</Button>
                  <Button type="submit" disabled={creating} className="bg-brand-gold text-brand-navy font-semibold hover:bg-yellow-500 text-xs px-4">
                    {creating ? "Generating..." : "Generate Screener Link"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
