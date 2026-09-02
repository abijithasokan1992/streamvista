import React, { useState } from 'react';
import { CheckCircle, Shield, Activity, Loader2, PlayCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type QCResult = {
  assetId?: string;
  bitrateStable?: boolean;
  frameDrops?: number;
  passed?: boolean;
  timestamp?: string;
};

const initialQueue = [
  { id: '#ML-BATCH-04', progress: 75, status: 'ANALYTIC_SCAN', title: 'Malayalam Classics Vol 1' },
  { id: '#TM-BATCH-12', progress: 100, status: 'VERIFIED', title: 'Tamil Action Archive' },
  { id: '#HI-BATCH-01', progress: 20, status: 'METADATA_EXTRACTION', title: 'Hindi Indie Shorts' },
  { id: '#TE-BATCH-09', progress: 45, status: 'RIGHTS_AUDIT', title: 'Telugu Blockbusters 2026' },
];

const verificationProtocol = [
  { label: 'Video Integrity (Bitrate/Dropped Frames)', state: 'verified' as const },
  { label: 'Audio Sync & Noise Floor Audit', state: 'verified' as const },
  { label: 'Legal Rights Metadata Verification', state: 'verified' as const },
  { label: 'Indic Language Dialect Accuracy', state: 'not_verified' as const },
  { label: 'Multi-DRM Handshake Audit', state: 'not_verified' as const },
];

function getAuthToken() {
  return supabase?.auth.getSession().then(({ data }) => data.session?.access_token ?? null);
}

export default function CrayonsLoop() {
  const [queue, setQueue] = useState(initialQueue);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<QCResult | null>(null);

  const triggerScan = async () => {
    setRunning(true);
    setMessage('');
    setResult(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setMessage('Secure session required. Sign in and retry the scan.');
        return;
      }

      const response = await fetch('/api/qc/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: 'ML-BATCH-04',
          filePath: undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'QC Scan execution failed');
      }

      const scanResult = payload.result as QCResult;
      setResult(scanResult);
      setQueue((current) => current.map((item) => item.id === '#ML-BATCH-04'
        ? { ...item, progress: scanResult.passed ? 100 : 90, status: scanResult.passed ? 'VERIFIED' : 'ANALYTIC_SCAN' }
        : item));
      setMessage(scanResult.passed ? 'QC scan completed. Media checks returned a pass.' : 'QC scan completed with warnings. Review before delivery.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'QC Scan execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="loop-container">
      <header className="loop-header">
        <div className="title-section">
          <h1 className="display-text">Crayons Loop</h1>
          <p className="subtitle">High-Precision Quality Control & Metadata Engine</p>
        </div>
        <div className="loop-actions">
          <button className="action-btn primary" onClick={triggerScan} disabled={running} type="button">
            {running ? <Loader2 size={16} className="spin" /> : <PlayCircle size={16} />}
            {running ? 'Scanning…' : 'Trigger New Scan'}
          </button>
        </div>
      </header>

      {message && <div className={`loop-alert ${result?.passed ? 'success' : 'warning'}`} role="status">{message}</div>}

      <div className="loop-grid">
        <section className="qc-queue-section">
          <div className="section-header">
            <h3>Active QC Queue</h3>
            <span className="badge">{queue.length} BATCHES ACTIVE</span>
          </div>
          <div className="queue-list">
            {queue.map((item) => (
              <QCItem key={item.id} {...item} />
            ))}
          </div>

          {result && (
            <section className="result-card" aria-label="Latest QC result">
              <div>
                <span className="result-kicker">LATEST SCAN RESULT</span>
                <h3>{result.assetId || 'ML-BATCH-04'}</h3>
              </div>
              <div className="result-grid">
                <div><span>Bitrate</span><strong>{result.bitrateStable ? 'STABLE' : 'WARNING'}</strong></div>
                <div><span>Dropped Frames</span><strong>{result.frameDrops ?? '—'}</strong></div>
                <div><span>Decision</span><strong>{result.passed ? 'PASSED' : 'REVIEW'}</strong></div>
              </div>
            </section>
          )}
        </section>

        <aside className="protocol-sidebar">
          <div className="protocol-card">
            <div className="card-header">
              <div>
                <h3>Verification Protocol</h3>
                <p className="protocol-caption">Production evidence gate</p>
              </div>
              <Shield size={18} className="icon-gold" />
            </div>
            <div className="protocol-steps">
              {verificationProtocol.map((step) => <ProtocolStep key={step.label} label={step.label} state={step.state} />)}
            </div>
            <div className="protocol-footer">
              <Activity size={14} />
              <span>OCI telemetry: not independently verified</span>
            </div>
            <div className="evidence-note">
              <AlertTriangle size={14} />
              <span>Dialect and DRM checks remain gated until live integration evidence is recorded.</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .loop-container{max-width:1400px;margin:0 auto}.loop-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;gap:24px}.loop-actions{display:flex}.action-btn{display:inline-flex;align-items:center;gap:8px}.action-btn:disabled{opacity:.6;cursor:not-allowed}.loop-alert{margin:-12px 0 28px;padding:12px 16px;border-radius:8px;border:1px solid var(--glass-border);font-size:.8rem}.loop-alert.success{color:#d1fae5}.loop-alert.warning{color:#fef3c7}.loop-grid{display:grid;grid-template-columns:1fr;gap:40px}@media (min-width:1024px){.loop-grid{grid-template-columns:1fr 340px}}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.section-header h3{font-family:var(--font-display);font-size:1.2rem;color:var(--royal-gold)}.badge{font-size:.65rem;font-weight:700;color:var(--royal-gold);border:1px solid var(--royal-gold-muted);padding:2px 8px;border-radius:4px}.queue-list{display:flex;flex-direction:column;gap:16px}.qc-item-card{background:var(--glass-surface);border:1px solid var(--glass-border);padding:20px;border-radius:8px;transition:var(--transition-smooth)}.qc-item-card:hover{border-color:var(--royal-gold-muted);transform:translateX(4px)}.qc-info{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:20px}.qc-id{font-family:monospace;font-size:.75rem;color:var(--royal-gold);display:block}.qc-title{font-size:.95rem;font-weight:600;color:white}.qc-status{font-size:.65rem;font-weight:700;color:var(--studio-silver-muted);text-transform:uppercase;text-align:right}.progress-bar-container{height:4px;background:rgba(255,255,255,.05);border-radius:2px;overflow:hidden}.progress-bar-fill{height:100%;background:var(--royal-gold);box-shadow:0 0 10px var(--royal-gold-muted);transition:width 1s ease-in-out}.protocol-card{background:var(--glass-surface);border:1px solid var(--glass-border);padding:30px;border-radius:12px;position:sticky;top:120px}.protocol-card .card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}.protocol-card h3{font-family:var(--font-display);font-size:1.1rem;color:var(--royal-gold);margin:0}.protocol-caption{margin:5px 0 0;font-size:.62rem;color:var(--studio-silver-muted);text-transform:uppercase;letter-spacing:.12em}.protocol-steps{display:flex;flex-direction:column;gap:20px}.step-item{display:flex;align-items:center;gap:12px;font-size:.8rem}.dot{width:6px;height:6px;border-radius:50%;flex:none}.dot.verified{background:#10b981;box-shadow:0 0 8px #10b981}.dot.not_verified{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,.45)}.step-label{color:var(--studio-silver-muted)}.step-check{color:#10b981;margin-left:auto}.step-status{color:#f59e0b;margin-left:auto;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.protocol-footer{margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:10px;font-size:.62rem;color:var(--studio-silver-muted);text-transform:uppercase}.evidence-note{margin-top:16px;padding:12px;border:1px solid rgba(245,158,11,.18);border-radius:8px;display:flex;gap:10px;align-items:flex-start;color:#fef3c7;font-size:.65rem;line-height:1.5}.result-card{margin-top:24px;background:var(--glass-surface);border:1px solid var(--glass-border);padding:22px;border-radius:10px}.result-kicker{font-size:.62rem;letter-spacing:.16em;color:var(--studio-silver-muted)}.result-card h3{margin:5px 0 18px;color:var(--royal-gold);font-family:monospace}.result-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.result-grid div{padding:12px;border:1px solid var(--glass-border);border-radius:8px}.result-grid span{display:block;font-size:.62rem;color:var(--studio-silver-muted);text-transform:uppercase}.result-grid strong{display:block;margin-top:6px;font-size:.8rem;color:white}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function QCItem({ id, progress, status, title }: { id:string;progress:number;status:string;title:string }) {
  return <div className="qc-item-card"><div className="qc-info"><div><span className="qc-id">{id}</span><span className="qc-title">{title}</span></div><span className="qc-status">{status}</span></div><div className="progress-bar-container"><div className="progress-bar-fill" style={{width:`${progress}%`}} /></div></div>;
}

function ProtocolStep({ label, state }: { label:string;state:'verified'|'not_verified' }) {
  return <div className="step-item"><div className={`dot ${state}`} /><span className="step-label">{label}</span>{state === 'verified' ? <CheckCircle size={14} className="step-check" /> : <span className="step-status">GATED</span>}</div>;
}
