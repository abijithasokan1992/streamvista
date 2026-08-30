import React, { useState } from 'react';
import { Database, Upload, HardDrive, Camera, Cpu, Activity, ShieldCheck, Plus } from 'lucide-react';

export default function CreatorStudio() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSource, setSelectedSource] = useState('card');

  return (
    <div className="studio-container">
      <div className="studio-header">
        <div className="title-section">
          <h1 className="display-text">Creator Studio</h1>
          <p className="subtitle">Production Ingest &amp; Management</p>
        </div>
        <div className="studio-actions">
          <button onClick={() => setActiveTab('ingest')} className="action-btn primary">
            <Plus size={18} />
            <span>New Ingest</span>
          </button>
        </div>
      </div>

      <div className="studio-grid">
        <aside className="studio-nav">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>
            <Activity size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('ingest')} className={activeTab === 'ingest' ? 'active' : ''}>
            <Upload size={18} /> Ingest Gate
          </button>
          <button className="disabled" disabled><Database size={18} /> Master Delivery</button>
          <button className="disabled" disabled><ShieldCheck size={18} /> QC Registry</button>
        </aside>

        <main className="studio-main">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <div className="metrics-row">
                <div className="metric-card">
                  <span className="label">Live Operations</span>
                  <span className="value">—</span>
                  <div className="metric-footer">Awaiting verified production telemetry</div>
                </div>
                <div className="metric-card">
                  <span className="label">Ingest Pipeline</span>
                  <span className="value">—</span>
                  <div className="metric-footer">Awaiting verified ingest persistence</div>
                </div>
                <div className="metric-card gold">
                  <span className="label">Vault Storage</span>
                  <span className="value">—</span>
                  <div className="metric-footer">Live storage totals unavailable</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="desc">Production activity will appear here when backed by verified Creator Studio data.</span>
                    <span className="status info">NOT CONNECTED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingest' && (
            <div className="ingest-view">
              <div className="ingest-form-container">
                <h2>Hardware Media Ingest Gate</h2>
                <p>Select the existing source and continue only when a verified storage backend is available.</p>

                <form onSubmit={(e) => e.preventDefault()} className="ingest-form">
                  <div className="source-selector">
                    <button type="button" onClick={() => setSelectedSource('camera')} className={selectedSource === 'camera' ? 'active' : ''}>
                      <Camera size={20} /> <span>Camera (C2C)</span>
                    </button>
                    <button type="button" onClick={() => setSelectedSource('card')} className={selectedSource === 'card' ? 'active' : ''}>
                      <Cpu size={20} /> <span>Memory Card</span>
                    </button>
                    <button type="button" onClick={() => setSelectedSource('harddisk')} className={selectedSource === 'harddisk' ? 'active' : ''}>
                      <HardDrive size={20} /> <span>Hard Disk</span>
                    </button>
                  </div>

                  <div className="drop-zone">
                    <Upload className="upload-icon" />
                    <p>{selectedSource === 'camera' ? 'Camera integration pending verification' : 'Verified upload backend required before commit'}</p>
                    <span>Supported: .mxf, .exr, .raw, .braw</span>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setActiveTab('dashboard')} className="btn-secondary">Cancel</button>
                    <button type="button" className="btn-primary" disabled>
                      Ingest unavailable — verified backend required
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .studio-container { max-width: 1400px; margin: 0 auto; }
        .studio-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px; }
        .subtitle { color:var(--studio-silver-muted); font-size:.9rem; text-transform:uppercase; letter-spacing:1px; }
        .action-btn.primary { background:var(--royal-gold); color:var(--obsidian); padding:10px 20px; border-radius:4px; font-weight:700; display:flex; align-items:center; gap:8px; text-transform:uppercase; font-size:.8rem; }
        .studio-grid { display:grid; grid-template-columns:240px 1fr; gap:40px; }
        .studio-nav { display:flex; flex-direction:column; gap:8px; }
        .studio-nav button { text-align:left; padding:12px 16px; border-radius:6px; color:var(--studio-silver-muted); font-size:.9rem; display:flex; align-items:center; gap:12px; border:1px solid transparent; background:transparent; }
        .studio-nav button.active { background:rgba(212,175,55,.1); border-color:var(--glass-border); color:var(--royal-gold); }
        .studio-nav button:hover:not(.disabled):not(:disabled) { background:rgba(255,255,255,.05); color:white; }
        .studio-nav button.disabled { opacity:.4; cursor:not-allowed; }
        .metrics-row { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:40px; }
        .metric-card { background:var(--glass-surface); border:1px solid var(--glass-border); padding:24px; border-radius:8px; display:flex; flex-direction:column; }
        .metric-card.gold { border-color:var(--royal-gold-muted); }
        .metric-card .label { font-size:.7rem; text-transform:uppercase; color:var(--studio-silver-muted); margin-bottom:8px; }
        .metric-card .value { font-size:1.8rem; font-weight:700; color:white; margin-bottom:4px; }
        .metric-card.gold .value { color:var(--royal-gold); }
        .metric-card .metric-footer { font-size:.65rem; color:var(--studio-silver-muted); }
        .recent-activity { background:var(--glass-surface); border:1px solid var(--glass-border); border-radius:8px; padding:30px; }
        .recent-activity h3 { font-family:var(--font-display); font-size:1.2rem; margin-bottom:24px; color:var(--royal-gold); }
        .activity-item { display:flex; align-items:center; gap:20px; padding:16px 0; border-bottom:1px solid rgba(255,255,255,.05); font-size:.85rem; }
        .activity-item .desc { flex:1; color:var(--studio-silver); }
        .activity-item .status { font-size:.65rem; font-weight:700; padding:2px 6px; border-radius:4px; }
        .activity-item .status.info { color:#3b82f6; background:rgba(59,130,246,.1); }
        .ingest-view { background:var(--glass-surface); border:1px solid var(--glass-border); border-radius:12px; padding:40px; max-width:800px; }
        .ingest-view h2 { font-family:var(--font-display); color:var(--royal-gold); margin-bottom:8px; }
        .ingest-view p { color:var(--studio-silver-muted); margin-bottom:30px; font-size:.9rem; }
        .source-selector { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .source-selector button { display:flex; flex-direction:column; align-items:center; gap:10px; padding:20px; background:rgba(0,0,0,.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--studio-silver-muted); font-size:.8rem; }
        .source-selector button.active { border-color:var(--royal-gold); color:var(--royal-gold); background:rgba(212,175,55,.05); }
        .drop-zone { border:2px dashed var(--glass-border); border-radius:12px; padding:60px 20px; text-align:center; margin-bottom:30px; transition:var(--transition-smooth); }
        .drop-zone:hover { border-color:var(--royal-gold-muted); }
        .upload-icon { width:48px; height:48px; color:var(--royal-gold-muted); margin-bottom:16px; }
        .drop-zone p { color:white; margin-bottom:4px; }
        .drop-zone span { font-size:.75rem; color:var(--studio-silver-muted); }
        .form-actions { display:flex; justify-content:flex-end; gap:16px; }
        .btn-secondary { color:var(--studio-silver-muted); font-weight:600; font-size:.9rem; }
        .btn-primary { background:var(--royal-gold); color:var(--obsidian); padding:12px 30px; border-radius:6px; font-weight:700; text-transform:uppercase; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
