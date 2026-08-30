import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Award, ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadRevenue() {
      if (!supabase) {
        if (mounted) { setError('Authentication is not configured.'); setLoading(false); }
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) { setError('Sign in to view revenue.'); setLoading(false); return; }
      try {
        const response = await fetch('/api/revenue', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error || 'Unable to load revenue');
        if (!mounted) return;
        const rows = Array.isArray(body.transactions) ? body.transactions : [];
        setTransactions(rows);
        setGrossRevenue(Number(body.grossRevenue || 0));
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to load revenue');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRevenue();
    return () => { mounted = false; };
  }, []);

  const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  return (
    <div className="revenue-container">
      <header className="revenue-header">
        <div className="title-section">
          <h1 className="display-text">Revenue Intelligence</h1>
          <p className="subtitle">Verified licensing & payment activity from StreamVista</p>
        </div>
      </header>

      {loading && <div className="state-card"><Loader2 className="animate-spin" size={24} /><span>Loading verified revenue…</span></div>}
      {!loading && error && <div className="state-card error">{error}</div>}

      <div className="metrics-grid">
        <FinStat label="Captured / Authorized Revenue" value={formatCurrency(grossRevenue)} icon={<DollarSign size={20} />} />
        <FinStat label="Successful Transactions" value={String(transactions.length)} icon={<TrendingUp size={20} />} />
        <FinStat label="Verified Payment Records" value={String(transactions.filter((tx) => tx.verified_at).length)} icon={<Users size={20} />} />
        <FinStat label="Revenue Source" value="Razorpay" icon={<Award size={20} />} />
      </div>

      <div className="transactions-section">
        <div className="section-header">
          <h3>Verified Transactions</h3>
          <span className="source-label">Supabase · Razorpay</span>
        </div>
        <div className="transaction-list">
          {transactions.length === 0 && !loading ? (
            <div className="empty-state">No verified customer payments yet.</div>
          ) : transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              date={new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              entity={tx.purpose || 'Marketplace payment'}
              amount={formatCurrency(Number(tx.amount || 0))}
              type={tx.status || 'unknown'}
            />
          ))}
        </div>
      </div>

      <style>{`
        .revenue-container{max-width:1400px;margin:0 auto}.revenue-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px}.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:40px}.metric-card{background:var(--glass-surface);border:1px solid var(--glass-border);padding:24px;border-radius:8px;position:relative}.metric-icon{position:absolute;top:24px;right:24px;color:var(--royal-gold-muted)}.metric-card .label{font-size:.75rem;color:var(--studio-silver-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:block}.metric-card .value{font-size:2rem;font-weight:700;color:#fff;margin-bottom:8px;display:block}.analytics-layout{display:grid;grid-template-columns:1fr;gap:30px}.transactions-section{background:var(--glass-surface);border:1px solid var(--glass-border);padding:30px;border-radius:12px}.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px}.section-header h3{font-family:var(--font-display);font-size:1.2rem;color:var(--royal-gold)}.source-label{font-size:.75rem;color:var(--studio-silver-muted)}.transaction-list{display:flex;flex-direction:column}.tx-item{display:flex;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.05)}.tx-date{font-size:.75rem;color:var(--studio-silver-muted);width:110px}.tx-entity{flex:1}.tx-entity-name{display:block;font-size:.9rem;font-weight:600;color:#fff}.tx-type{font-size:.65rem;color:var(--studio-silver-muted);text-transform:uppercase}.tx-amount{color:#10b981;font-weight:700;font-size:.95rem}.state-card,.empty-state{background:var(--glass-surface);border:1px solid var(--glass-border);padding:24px;border-radius:12px;color:var(--studio-silver-muted);display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:30px}.state-card.error{color:#fca5a5}.animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function FinStat({ label, value, icon }: any) {
  return <div className="metric-card"><div className="metric-icon">{icon}</div><span className="label">{label}</span><span className="value">{value}</span></div>;
}

function TransactionRow({ date, entity, amount, type }: any) {
  return <div className="tx-item"><div className="tx-date">{date}</div><div className="tx-entity"><span className="tx-entity-name">{entity}</span><span className="tx-type">{type}</span></div><div className="tx-amount">+{amount}</div><ArrowUpRight size={14} /> </div>;
}
