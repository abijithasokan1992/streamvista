import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import AssetCard from '../../components/AssetCard';
import LicenseCheckout from '../../components/LicenseCheckout';

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Mock data for Assets
  const assets = [
    { id: 'ML-4501', title: 'Drishyam 2: The Resumption', language: 'Malayalam', resolution: '4K UHD', price: 45000, qcStatus: 'PASSED', type: 'CONTENT' },
    { id: 'TE-2204', title: 'Pushpa: The Rise', language: 'Telugu', resolution: '8K Master', price: 85000, qcStatus: 'PASSED', type: 'CONTENT' },
    { id: 'HI-8812', title: 'Jawan: Extended Cut', language: 'Hindi', resolution: '4K ProRes', price: 62000, qcStatus: 'PASSED', type: 'CONTENT' },
  ];

  // MediaTech & AI Services Catalog
  const services = [
    { id: 'SVC-QC-01', title: 'Content QC Certificate', language: 'GLOBAL', resolution: 'OTT SPEC', price: 4999, qcStatus: 'PASSED', type: 'SERVICE' },
    { id: 'SVC-AI-01', title: 'AI Audio Enhancement', language: 'INDIC', resolution: 'HI-RES', price: 2999, qcStatus: 'PASSED', type: 'SERVICE' },
    { id: 'SVC-DEL-01', title: 'Encrypted Master Delivery', language: 'SECURE', resolution: 'DCP/IMF', price: 9999, qcStatus: 'PASSED', type: 'SERVICE' },
    { id: 'SVC-LOC-01', title: 'AI Multi-Lang Dubbing', language: 'PAN-INDIA', resolution: 'TONE-SYNC', price: 15000, qcStatus: 'PASSED', type: 'SERVICE' },
  ];

  const allItems = [...assets, ...services];
  const filteredItems = allItems.filter(item => 
    (activeCategory === 'ALL' || item.type === activeCategory) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <div className="header-info">
          <h1>Asset Marketplace</h1>
          <p>Rights-Cleared, QC-Verified Regional Film Content.</p>
        </div>
        
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title, actor, or language..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="marketplace-layout">
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h3>Language</h3>
            <label className="filter-item"><input type="checkbox" /> Malayalam</label>
            <label className="filter-item"><input type="checkbox" /> Tamil</label>
            <label className="filter-item"><input type="checkbox" /> Hindi</label>
            <label className="filter-item"><input type="checkbox" /> Telugu</label>
          </div>

          <div className="filter-group">
            <h3>Resolution</h3>
            <label className="filter-item"><input type="checkbox" /> 8K Master</label>
            <label className="filter-item"><input type="checkbox" /> 4K ProRes</label>
            <label className="filter-item"><input type="checkbox" /> 4K UHD</label>
          </div>

          <div className="filter-group">
            <h3>Rights Type</h3>
            <label className="filter-item"><input type="checkbox" /> OTT Worldwide</label>
            <label className="filter-item"><input type="checkbox" /> AI Training Data</label>
            <label className="filter-item"><input type="checkbox" /> FAST Channel</label>
          </div>
        </aside>

        <main className="assets-grid">
          <div className="grid-header">
            <div className="category-toggles">
              <button onClick={() => setActiveCategory('ALL')} className={activeCategory === 'ALL' ? 'active' : ''}>All</button>
              <button onClick={() => setActiveCategory('CONTENT')} className={activeCategory === 'CONTENT' ? 'active' : ''}>Film Assets</button>
              <button onClick={() => setActiveCategory('SERVICE')} className={activeCategory === 'SERVICE' ? 'active' : ''}>MediaTech Services</button>
            </div>
            <button className="sort-btn">Sort by: Premium <ChevronDown size={14} /></button>
          </div>
          
          <div className="grid">
            {filteredItems.map(item => (
              <AssetCard 
                key={item.id}
                id={item.id}
                title={item.title}
                language={item.language}
                resolution={item.resolution}
                price={item.price.toLocaleString()}
                qcStatus={item.qcStatus as any}
                onLicense={() => setSelectedAsset(item)}
              />
            ))}
          </div>
        </main>
      </div>

      {selectedAsset && (
        <LicenseCheckout 
          assetId={selectedAsset.id}
          title={selectedAsset.title}
          price={selectedAsset.price}
          onSuccess={() => console.log('License acquired!')}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      <style>{`
        .marketplace-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .marketplace-header {
          display: flex;
          flex-direction: column;
          gap: 30px;
          margin-bottom: 50px;
        }

        @media (min-width: 768px) {
          .marketplace-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
          }
        }

        .header-info h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .header-info p {
          color: var(--studio-silver-muted);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .search-bar {
          background: var(--glass-surface);
          border: 1px solid var(--glass-border);
          padding: 12px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          color: var(--royal-gold);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 0.9rem;
        }

        .marketplace-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 1024px) {
          .marketplace-layout {
            grid-template-columns: 240px 1fr;
          }
        }

        .filters-sidebar {
          display: none;
        }

        @media (min-width: 1024px) {
          .filters-sidebar {
            display: block;
          }
        }

        .filter-group {
          margin-bottom: 32px;
        }

        .filter-group h3 {
          font-size: 0.8rem;
          margin-bottom: 16px;
          color: var(--royal-gold);
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--studio-silver-muted);
          margin-bottom: 10px;
          cursor: pointer;
        }

        .filter-item:hover {
          color: white;
        }

        .assets-grid {
          flex: 1;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          font-size: 0.8rem;
          color: var(--studio-silver-muted);
        }

        .category-toggles {
          display: flex;
          gap: 12px;
        }

        .category-toggles button {
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          color: var(--studio-silver-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
        }

        .category-toggles button.active {
          background: var(--royal-gold);
          color: var(--obsidian);
          border-color: var(--royal-gold);
        }

        .sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--royal-gold);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;
