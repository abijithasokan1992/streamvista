import React from 'react';
import { ArrowUpRight, DollarSign, FileText, Handshake, PackageCheck, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RevenueDashboard() {
  return (
    <div className="revenue-container">
      <header className="revenue-header">
        <div className="title-section">
          <h1 className="display-text">Revenue Intelligence</h1>
          <p className="subtitle">Turn your catalogue, services and licensing rights into revenue.</p>
        </div>
        <Link className="action-btn primary" to="/creator-studio">Open Studio</Link>
      </header>

      <div className="metrics-grid">
        <FinStat label="Verified Revenue" value="₹0" note="No verified payments yet" icon={<DollarSign size={20} />} />
        <FinStat label="Paid Plans" value="₹767" note="Creator · 1 TB / month" icon={<PackageCheck size={20} />} />
        <FinStat label="Licensing Leads" value="0" note="Publish an offer to start" icon={<Handshake size={20} />} />
        <FinStat label="Pending Payouts" value="₹0" note="No payouts recorded" icon={<FileText size={20} />} />
      </div>

      <div className="revenue-actions-grid">
        <RevenueAction icon={<PackageCheck size={20} />} title="Sell Creator Plans" text="Paid studio access and storage are already connected to Razorpay." href="/pricing" cta="View pricing" />
        <RevenueAction icon={<Handshake size={20} />} title="License Your Catalogue" text="Create licensing offers for OTT, AI, archive and distribution buyers." href="/creator-studio" cta="Create offer" />
        <RevenueAction icon={<UploadCloud size={20} />} title="Monetize Assets" text="Upload and package rights-ready assets instead of showing fictional sales." href="/creator-studio" cta="Open Studio" />
      </div>

      <div className="analytics-layout">
        <div className="chart-section">
          <div className="section-header"><h3>Revenue Sources</h3><ArrowUpRight size={18} className="icon-gold" /></div>
          <div className="empty-state">
            <strong>No verified revenue data yet</strong>
            <span>Revenue appears here only after a real payment or verified licensing transaction.</span>
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header"><h3>Recent Transactions</h3><span className="muted">Verified only</span></div>
          <div className="empty-state">
            <strong>No transactions recorded</strong>
            <span>Demo customers and fabricated transaction amounts have been removed.</span>
            <Link className="text-link" to="/pricing">Start with a paid plan <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>

      <style>{`
        .revenue-container { max-width: 1400px; margin: 0 auto; }
        .revenue-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:40px; gap:24px; }
        .metrics-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px; margin-bottom:30px; }
        .metric-card,.chart-section,.transactions-section { background:var(--glass-surface); border:1px solid var(--glass-border); }
        .metric-card { padding:24px; border-radius:8px; position:relative; }
        .metric-icon { position:absolute; top:24px; right:24px; color:var(--royal-gold-muted); }
        .metric-card .label { font-size:.75rem; color:var(--studio-silver-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block; }
        .metric-card .value { font-size:2rem; font-weight:700; color:white; margin-bottom:8px; display:block; }
        .metric-note,.muted { font-size:.72rem; color:var(--studio-silver-muted); }
        .action-btn { display:inline-block; padding:10px 16px; border-radius:6px; font-size:.8rem; text-decoration:none; }
        .action-btn.primary { background:var(--royal-gold); color:#111; font-weight:700; }
        .revenue-actions-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:20px; margin-bottom:30px; }
        .revenue-action { background:var(--glass-surface); border:1px solid var(--glass-border); border-radius:10px; padding:22px; }
        .revenue-action-icon { color:var(--royal-gold); margin-bottom:14px; }
        .revenue-action h3 { margin:0 0 8px; color:white; font-size:1rem; }
        .revenue-action p { margin:0 0 16px; color:var(--studio-silver-muted); font-size:.8rem; line-height:1.5; }
        .text-link { color:var(--royal-gold); font-size:.78rem; display:inline-flex; align-items:center; gap:5px; text-decoration:none; }
        .analytics-layout { display:grid; grid-template-columns:1fr; gap:30px; }
        @media (min-width:1024px) { .analytics-layout { grid-template-columns:1fr 1fr; } }
        .chart-section,.transactions-section { padding:30px; border-radius:12px; min-height:260px; }
        .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .section-header h3 { font-family:var(--font-display); font-size:1.2rem; color:var(--royal-gold); margin:0; }
        .icon-gold { color:var(--royal-gold); }
        .empty-state { min-height:170px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:10px; color:var(--studio-silver-muted); font-size:.8rem; line-height:1.5; }
        .empty-state strong { color:white; font-size:.95rem; }
      `}</style>
    </div>
  );
}

function FinStat({ label, value, note, icon }: any) {
  return <div className="metric-card"><div className="metric-icon">{icon}</div><span className="label">{label}</span><span className="value">{value}</span><span className="metric-note">{note}</span></div>;
}

function RevenueAction({ icon, title, text, href, cta }: any) {
  return <div className="revenue-action"><div className="revenue-action-icon">{icon}</div><h3>{title}</h3><p>{text}</p><Link className="text-link" to={href}>{cta} <ArrowUpRight size={14} /></Link></div>;
}
