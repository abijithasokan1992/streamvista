import React from 'react';
import { Shield, Play, Lock, Globe, CheckCircle } from 'lucide-react';

interface AssetCardProps {
  id: string;
  title: string;
  language: string;
  resolution: string;
  price: string;
  thumbnail?: string;
  qcStatus: 'PASSED' | 'PENDING' | 'FAILED';
  onLicense?: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ id, title, language, resolution, price, thumbnail, qcStatus, onLicense }) => {
  return (
    <div className="asset-card">
      <div className="card-image">
        {thumbnail ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <div className="thumbnail-placeholder">
            <Film className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="qc-badge">
          {qcStatus === 'PASSED' && <><CheckCircle size={14} /> <span>QC VERIFIED</span></>}
          {qcStatus === 'PENDING' && <><Shield size={14} /> <span>QC PENDING</span></>}
        </div>
        <div className="play-overlay">
          <Play fill="currentColor" />
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className="asset-id">{id}</span>
          <span className="asset-lang"><Globe size={12} /> {language}</span>
        </div>
        <h3 className="asset-title">{title}</h3>
        <div className="asset-meta">
          <span>{resolution}</span>
          <span className="separator">•</span>
          <span>Rights-Cleared</span>
        </div>
        
        <div className="card-footer">
          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">{price}</span>
          </div>
          <button className="license-btn" onClick={onLicense}>
            <Lock size={14} />
            <span>LICENSE</span>
          </button>
        </div>
      </div>

      <style>{`
        .asset-card {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          overflow: hidden;
          transition: var(--transition-smooth);
          position: relative;
        }

        .asset-card:hover {
          transform: translateY(-8px);
          border-color: var(--royal-gold-muted);
          box-shadow: var(--glass-shadow);
        }

        .card-image {
          height: 200px;
          background: #151515;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .asset-card:hover .card-image img {
          scale: 1.1;
        }

        .qc-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #10b981;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-smooth);
          color: var(--royal-gold);
        }

        .asset-card:hover .play-overlay {
          opacity: 1;
        }

        .card-content {
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .asset-id {
          font-size: 0.7rem;
          color: var(--studio-silver-muted);
          font-family: monospace;
        }

        .asset-lang {
          font-size: 0.75rem;
          color: var(--royal-gold);
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
        }

        .asset-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: white;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .asset-meta {
          font-size: 0.75rem;
          color: var(--studio-silver-muted);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .price-tag {
          color: var(--royal-gold);
        }

        .amount {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .license-btn {
          background: transparent;
          border: 1px solid var(--royal-gold-muted);
          color: var(--royal-gold);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .license-btn:hover {
          background: var(--royal-gold);
          color: var(--obsidian);
        }
      `}</style>
    </div>
  );
};

export default AssetCard;
