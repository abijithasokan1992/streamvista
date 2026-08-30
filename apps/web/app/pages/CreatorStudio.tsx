import React, { useEffect, useState } from 'react';
import { Database, Upload, HardDrive, Camera, Cpu, Activity, ShieldCheck, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSource, setSelectedSource] = useState('card');
  const [titleCount, setTitleCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadCreatorData() {
      if (!supabase) {
        if (mounted) setLoadError('Authentication is not configured.');
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (mounted) setLoadError('Sign in to load your Creator Studio workspace.');
        return;
      }
      const { count, error } = await supabase
        .from('sv_app_titles')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', data.session.user.id);
      if (!mounted) return;
      if (error) setLoadError(error.message);
      else setTitleCount(count ?? 0);
    }
    loadCreatorData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="studio-container">
      <div className="studio-header">
        <div className="title-section">
          <h1 className="display-text">Creator Studio</h1>
          <p className="subtitle">Production Ingest &amp; Management</p>
        </div>
        <div className="studio-actions">
          <button onClick={() => setActiveTab('ingest')} className="action-btn primary"><Plus size={18} /><span>New Ingest</span></button>
        </div>
      </div>

      {loadError && <div className="notice error"><AlertTriangle size={17} /><span>{loadError}</span></div>}

      <div className="studio-grid">
        <aside className="studio-nav">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}><Activity size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab('ingest')} className={activeTab === 'ingest' ? 'active' : ''}><Upload size={18} /> Ingest Gate</button>
          <button onClick={() => setActiveTab('titles')} className={activeTab === 'titles' ? 'active' : ''}><Database size={18} /> My Titles</button>
          <button className="disabled" disabled><ShieldCheck size={18} /> QC Registry</button>
        </aside>

        <main className="studio-main">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <div className="metrics-row">
                <Metric label="My Titles" value={titleCount === null ? '—' : String(titleCount)} footer="Canonical Supabase titles" />
                <Metric label="Ingest Pipeline" value="READY" footer="Storage connector gate" />
                <Metric label="Workspace" value="ACTIVE" footer="Supabase-authenticated session" gold />
              </div>
              <div className="recent-activity">
                <h3>Creator Workspace</h3>
                <div className="activity-item"><span className="desc">Your dashboard is connected to the canonical Creator Studio data layer.</span><span className="status ok"><CheckCircle2 size={13} /> CONNECTED</span></div>
                {titleCount === 0 && <div className="empty-note">No titles yet. Add your first title from the My Titles workspace.</div>}
              </div>
            </div>
          )}

          {activeTab === 'titles' && (
            <div className="recent-activity"><h3>My Titles</h3><div className="empty-note">{titleCount === 0 ? 'No titles found for this account.' : `${titleCount} title${titleCount === 1 ? '' : 's'} found in Supabase.`}</div></div>
          )}

          {activeTab === 'ingest' && (
            <div className="ingest-view">
              <div className="ingest-form-container">
                <h2>Hardware Media Ingest Gate</h2>
                <p>Select the existing source. Uploading remains gated until a verified storage endpoint is available.</p>
                <form onSubmit={(e) => e.preventDefault()} className="ingest-form">
                  <div className="source-selector">
                    {['camera','card','harddisk'].map((source) => <button key={source} type="button" onClick={() => setSelectedSource(source)} className={selectedSource === source ? 'active' : ''}>{source === 'camera' ? <Camera size={20} /> : source === 'card' ? <Cpu size={20} /> : <HardDrive size={20} />}<span>{source === 'camera' ? 'Camera (C2C)' : source === 'card' ? 'Memory Card' : 'Hard Disk'}</span></button>)}
                  </div>
                  <div className="drop-zone"><Upload className="upload-icon" /><p>Choose media from your selected source</p><span>Supported: .mxf, .exr, .raw, .braw</span></div>
                  <div className="form-actions"><button type="button" onClick={() => setActiveTab('dashboard')} className="btn-secondary">Cancel</button><button type="button" className="btn-primary">Prepare Ingest</button></div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{` .studio-container{max-width:1400px;margin:0 auto}.studio-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px}.subtitle{color:var(--studio-silver-muted);font-size:.9rem;text-transform:uppercase;letter-spacing:1px}.action-btn.primary{background:var(--royal-gold);color:var(--obsidian);padding:10px 20px;border-radius:4px;font-weight:700;display:flex;align-items:center;gap:8px;text-transform:uppercase;font-size:.8rem}.studio-grid{display:grid;grid-template-columns:240px 1fr;gap:40px}.studio-nav{display:flex;flex-direction:column;gap:8px}.studio-nav button{text-align:left;padding:12px 16px;border-radius:6px;color:var(--studio-silver-muted);font-size:.9rem;display:flex;align-items:center;gap:12px;border:1px solid transparent;background:transparent}.studio-nav button.active{background:rgba(212,175,55,.1);border-color:var(--glass-border);color:var(--royal-gold)}.studio-nav button:hover:not(.disabled):not(:disabled){background:rgba(255,255,255,.05);color:white}.studio-nav button.disabled{opacity:.4;cursor:not-allowed}.metrics-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}.metric-card{background:var(--glass-surface);border:1px solid var(--glass-border);padding:24px;border-radius:8px;display:flex;flex-direction:column}.metric-card.gold{border-color:var(--royal-gold-muted)}.metric-card .label{font-size:.7rem;text-transform:uppercase;color:var(--studio-silver-muted);margin-bottom:8px}.metric-card .value{font-size:1.8rem;font-weight:700;color:white;margin-bottom:4px}.metric-card.gold .value{color:var(--royal-gold)}.metric-card .metric-footer{font-size:.65rem;color:var(--studio-silver-muted)}.recent-activity{background:var(--glass-surface);border:1px solid var(--glass-border);border-radius:8px;padding:30px}.recent-activity h3{font-family:var(--font-display);font-size:1.2rem;margin-bottom:24px;color:var(--royal-gold)}.activity-item{display:flex;align-items:center;gap:20px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.85rem}.activity-item .desc{flex:1;color:var(--studio-silver)}.activity-item .status{font-size:.65rem;font-weight:700;padding:5px 8px;border-radius:4px;display:flex;align-items:center;gap:5px}.status.ok{color:#10b981;background:rgba(16,185,129,.1)}.empty-note{padding:18px 0;color:var(--studio-silver-muted);font-size:.9rem}.ingest-view{background:var(--glass-surface);border:1px solid var(--glass-border);border-radius:12px;padding:40px;max-width:800px}.ingest-view h2{font-family:var(--font-display);color:var(--royal-gold);margin-bottom:8px}.ingest-view p{color:var(--studio-silver-muted);margin-bottom:30px;font-size:.9rem}.source-selector{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}.source-selector button{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;background:rgba(0,0,0,.3);border:1px solid var(--glass-border);border-radius:8px;color:var(--studio-silver-muted);font-size:.8rem}.source-selector button.active{border-color:var(--royal-gold);color:var(--royal-gold);background:rgba(212,175,55,.05)}.drop-zone{border:2px dashed var(--glass-border);border-radius:12px;padding:60px 20px;text-align:center;margin-bottom:30px}.upload-icon{width:48px;height:48px;color:var(--royal-gold-muted);margin-bottom:16px}.drop-zone p{color:white;margin-bottom:4px}.drop-zone span{font-size:.75rem;color:var(--studio-silver-muted)}.form-actions{display:flex;justify-content:flex-end;gap:16px}.btn-secondary{color:var(--studio-silver-muted);font-weight:600;font-size:.9rem}.btn-primary{background:var(--royal-gold);color:var(--obsidian);padding:12px 30px;border-radius:6px;font-weight:700;text-transform:uppercase}.notice{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:8px;margin-bottom:24px;border:1px solid var(--glass-border);font-size:.85rem}.notice.error{color:#fca5a5;background:rgba(127,29,29,.12)}`}</style>
    </div>
  );
}

function Metric({ label, value, footer, gold = false }: { label: string; value: string; footer: string; gold?: boolean }) {
  return <div className={`metric-card${gold ? ' gold' : ''}`}><span className="label">{label}</span><span className="value">{value}</span><div className="metric-footer">{footer}</div></div>;
}
