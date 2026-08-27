import React from 'react';
import { RefreshCw, PlayCircle, Layers, CheckCircle, Shield, Activity, Search } from 'lucide-react';

export default function CrayonsLoop() {
  return (
    <div className="loop-container">
      <header className="loop-header">
        <div className="title-section">
          <h1 className="display-text">Crayons Loop</h1>
          <p className="subtitle">High-Precision Quality Control & Metadata Engine</p>
        </div>
        <div className="loop-actions">
          <button className="action-btn primary">Trigger New Scan</button>
        </div>
      </header>

      <div className="loop-grid">
        <section className="qc-queue-section">
          <div className="section-header">
            <h3>Active QC Queue</h3>
            <span className="badge">4 BATCHES ACTIVE</span>
          </div>
          <div className="queue-list">
            <QCItem id="#ML-BATCH-04" progress={75} status="ANALYTIC_SCAN" title="Malayalam Classics Vol 1" />
            <QCItem id="#TM-BATCH-12" progress={100} status="VERIFIED" title="Tamil Action Archive" />
            <QCItem id="#HI-BATCH-01" progress={20} status="METADATA_EXTRACTION" title="Hindi Indie Shorts" />
            <QCItem id="#TE-BATCH-09" progress={45} status="RIGHTS_AUDIT" title="Telugu Blockbusters 2026" />
          </div>
        </section>

        <aside className="protocol-sidebar">
          <div className="protocol-card">
            <div className="card-header">
              <h3>Verification Protocol</h3>
              <Shield size={18} className="icon-gold" />
            </div>
            <div className="protocol-steps">
              <ProtocolStep label="Video Integrity (Bitrate/Dropped Frames)" passed />
              <ProtocolStep label="Audio Sync & Noise Floor Audit" passed />
              <ProtocolStep label="Legal Rights Metadata Verification" passed />
              <ProtocolStep label="Indic Language Dialect Accuracy" active />
              <ProtocolStep label="Multi-DRM Handshake Audit" pending />
            </div>
            <div className="protocol-footer">
              <Activity size={14} />
              <span>Real-time OCI Infrastructure Monitoring Active</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .loop-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .loop-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .loop-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 1024px) {
          .loop-grid {
            grid-template-columns: 1fr 340px;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--royal-gold);
        }

        .badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--royal-gold);
          border: 1px solid var(--royal-gold-muted);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .qc-item-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          padding: 20px;
          border-radius: 8px;
          transition: var(--transition-smooth);
        }

        .qc-item-card:hover {
          border-color: var(--royal-gold-muted);
          transform: translateX(4px);
        }

        .qc-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .qc-id {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--royal-gold);
          display: block;
        }

        .qc-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
        }

        .qc-status {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--studio-silver-muted);
          text-transform: uppercase;
        }

        .progress-bar-container {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--royal-gold);
          box-shadow: 0 0 10px var(--royal-gold-muted);
          transition: width 1s ease-in-out;
        }

        .protocol-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          padding: 30px;
          border-radius: 12px;
          position: sticky;
          top: 120px;
        }

        .protocol-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .protocol-card h3 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--royal-gold);
        }

        .protocol-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot.passed { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .dot.active { background: var(--royal-gold); box-shadow: 0 0 8px var(--royal-gold); animation: pulse 2s infinite; }
        .dot.pending { background: rgba(255,255,255,0.1); }

        .step-label { color: var(--studio-silver-muted); }
        .step-item.active .step-label { color: white; font-weight: 600; }
        .step-check { color: #10b981; margin-left: auto; }

        .protocol-footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.65rem;
          color: var(--studio-silver-muted);
          text-transform: uppercase;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function QCItem({ id, progress, status, title }: any) {
  return (
    <div className="qc-item-card">
      <div className="qc-info">
        <div>
          <span className="qc-id">{id}</span>
          <span className="qc-title">{title}</span>
        </div>
        <span className="qc-status">{status}</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function ProtocolStep({ label, passed, active, pending }: any) {
  return (
    <div className={`step-item ${active ? 'active' : ''}`}>
      <div className={`dot ${passed ? 'passed' : (active ? 'active' : 'pending')}`}></div>
      <span className="step-label">{label}</span>
      {passed && <CheckCircle size={14} className="step-check" />}
    </div>
  );
}
