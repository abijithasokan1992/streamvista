import React from 'react';
import { TrendingUp, DollarSign, Users, Award, PieChart, ArrowUpRight } from 'lucide-react';

export default function RevenueDashboard() {
  return (
    <div className="revenue-container">
      <header className="revenue-header">
        <div className="title-section">
          <h1 className="display-text">Revenue Intelligence</h1>
          <p className="subtitle">Real-time Licensing & Distribution Analytics</p>
        </div>
        <div className="revenue-actions">
          <button className="action-btn outline">Export Report</button>
        </div>
      </header>

      <div className="metrics-grid">
        <FinStat label="Gross Revenue (Q3)" value="₹85.2M" trend="+14%" icon={<DollarSign size={20} />} />
        <FinStat label="Avg. Asset Value" value="₹12.4K" trend="+2%" icon={<TrendingUp size={20} />} />
        <FinStat label="Active Subscribers" value="4,821" trend="+8%" icon={<Users size={20} />} />
        <FinStat label="Payouts Pending" value="₹1.2M" status="STABLE" icon={<Award size={20} />} />
      </div>

      <div className="analytics-layout">
        <div className="chart-section">
          <div className="section-header">
            <h3>Revenue by Language</h3>
            <PieChart size={18} className="icon-gold" />
          </div>
          <div className="language-stats">
            <LanguageBar label="Malayalam" percentage={45} />
            <LanguageBar label="Tamil" percentage={30} />
            <LanguageBar label="Telugu" percentage={15} />
            <LanguageBar label="Hindi" percentage={10} />
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <button className="view-all">View All <ArrowUpRight size={14} /></button>
          </div>
          <div className="transaction-list">
            <TransactionRow date="AUG 26" entity="Google AI Division" amount="+₹4,50,000" type="LICENSING" />
            <TransactionRow date="AUG 24" entity="Sarvam AI" amount="+₹1,20,000" type="DATASET" />
            <TransactionRow date="AUG 21" entity="JioStar Marketing" amount="+₹8,90,000" type="OTT_BUNDLE" />
            <TransactionRow date="AUG 18" entity="Meta Labs" amount="+₹2,30,000" type="AI_TRAINING" />
          </div>
        </div>
      </div>

      <style>{`
        .revenue-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .revenue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          padding: 24px;
          border-radius: 8px;
          position: relative;
        }

        .metric-icon {
          position: absolute;
          top: 24px;
          right: 24px;
          color: var(--royal-gold-muted);
        }

        .metric-card .label {
          font-size: 0.75rem;
          color: var(--studio-silver-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: block;
        }

        .metric-card .value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          display: block;
        }

        .metric-trend {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .metric-trend.up { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .metric-trend.stable { background: rgba(192, 192, 192, 0.1); color: var(--studio-silver); }

        .analytics-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        @media (min-width: 1024px) {
          .analytics-layout {
            grid-template-columns: 1fr 1fr;
          }
        }

        .chart-section, .transactions-section {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          padding: 30px;
          border-radius: 12px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-header h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--royal-gold);
        }

        .icon-gold { color: var(--royal-gold); }

        .language-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .lang-item {
          width: 100%;
        }

        .lang-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .progress-bg {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--royal-gold);
          box-shadow: 0 0 10px var(--royal-gold-muted);
        }

        .transaction-list {
          display: flex;
          flex-direction: column;
        }

        .tx-item {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .tx-date {
          font-size: 0.75rem;
          color: var(--studio-silver-muted);
          width: 60px;
        }

        .tx-entity {
          flex: 1;
        }

        .tx-entity-name {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
        }

        .tx-type {
          font-size: 0.65rem;
          color: var(--studio-silver-muted);
          text-transform: uppercase;
        }

        .tx-amount {
          color: #10b981;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .view-all {
          color: var(--royal-gold-muted);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn.outline {
          border: 1px solid var(--glass-border);
          color: var(--studio-silver);
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}

function FinStat({ label, value, trend, status, icon }: any) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {trend ? (
        <span className="metric-trend up">{trend}</span>
      ) : (
        <span className="metric-trend stable">{status}</span>
      )}
    </div>
  );
}

function LanguageBar({ label, percentage }: any) {
  return (
    <div className="lang-item">
      <div className="lang-info">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function TransactionRow({ date, entity, amount, type }: any) {
  return (
    <div className="tx-item">
      <div className="tx-date">{date}</div>
      <div className="tx-entity">
        <span className="tx-entity-name">{entity}</span>
        <span className="tx-type">{type}</span>
      </div>
      <div className="tx-amount">{amount}</div>
    </div>
  );
}
