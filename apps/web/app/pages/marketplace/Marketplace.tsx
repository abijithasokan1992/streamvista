import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2, Search } from 'lucide-react';
import AssetCard from '../../components/AssetCard';
import CrayonsBridgeLicenseRequest from '../../components/CrayonsBridgeLicenseRequest';
import { supabase } from '../../lib/supabase';

type MarketplaceItem = {
  id: string;
  title: string;
  language: string;
  resolution: string;
  qcStatus: 'PASSED' | 'PENDING' | 'FAILED';
  titleId: string;
};

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MarketplaceItem | null>(null);
  const [assets, setAssets] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      if (!supabase) {
        setError('Supabase is not configured for this deployment.');
        setLoading(false);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setError('Please sign in to access Crayons Bridge.');
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase.from('sv_app_profiles').select('app_role, verification_status').eq('id', user.id).maybeSingle();
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
      if (active) setRole(profile?.app_role ?? null);
      const { data, error: titleError } = await supabase
        .from('sv_app_titles')
        .select('id,title,primary_language,status,metadata')
        .in('status', ['approved', 'ready_for_distribution'])
        .order('created_at', { ascending: false });
      if (titleError) {
        setError(titleError.message);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as Array<{ id: string; title: string; primary_language: string | null; metadata: Record<string, unknown> | null }>;
      const mapped = rows.map((row) => {
        const metadata = row.metadata ?? {};
        const qcStatus = String(metadata.qc_status ?? 'PASSED').toUpperCase();
        return {
          id: `TITLE-${row.id.slice(0, 8).toUpperCase()}`,
          title: row.title,
          language: row.primary_language || String(metadata.language ?? 'GLOBAL'),
          resolution: String(metadata.resolution ?? 'MASTER'),
          qcStatus: qcStatus === 'FAILED' ? 'FAILED' : qcStatus === 'PENDING' ? 'PENDING' : 'PASSED',
          titleId: row.id,
        };
      });
      if (active) {
        setAssets(mapped);
        setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const filteredItems = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return assets.filter((item) => !needle || [item.title, item.language, item.resolution, item.id].some((value) => value.toLowerCase().includes(needle)));
  }, [assets, searchQuery]);

  const handleLicense = (asset: MarketplaceItem) => {
    if (role !== 'buyer') {
      setError('Licensing requests are available to approved buyer accounts.');
      return;
    }
    setError('');
    setSelectedAsset(asset);
  };

  return (
    <div className="marketplace-container">
      <header className="marketplace-header">
        <div className="header-info">
          <div className="eyebrow">CRAYONS BRIDGE · RIGHTS MARKETPLACE</div>
          <h1>Content Catalog</h1>
          <p>Approved content, rights context and buyer-controlled licensing requests.</p>
        </div>
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search title, language, resolution…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
      </header>
      <div className="status-row"><span className="status-pill">{role ? `ROLE · ${role.toUpperCase()}` : 'AUTHENTICATED'}</span><span className="status-pill">{loading ? 'SYNCING SUPABASE…' : `${assets.length} APPROVED TITLES`}</span></div>
      {error && <div className="marketplace-error">{error}</div>}
      <div className="marketplace-layout">
        <aside className="filters-sidebar"><div className="filter-group"><h3>Language</h3>{['Malayalam', 'Tamil', 'Hindi', 'Telugu'].map((language) => <label className="filter-item" key={language}><input type="checkbox" disabled /> {language}</label>)}</div><div className="filter-group"><h3>Rights</h3>{['OTT', 'TV', 'FAST', 'AI Data'].map((right) => <label className="filter-item" key={right}><input type="checkbox" disabled /> {right}</label>)}</div></aside>
        <main className="assets-grid"><div className="grid-header"><div className="category-toggles"><button className="active" type="button">Approved Content</button></div><button className="sort-btn" type="button" disabled>Catalog <ChevronDown size={14} /></button></div>{loading ? <div className="empty-state"><Loader2 className="animate-spin" /> Loading approved titles…</div> : filteredItems.length === 0 ? <div className="empty-state"><div><div className="empty-title">No approved titles found.</div><div className="empty-copy">Titles appear here after administrator verification and approval.</div></div></div> : <div className="grid">{filteredItems.map((item) => <AssetCard key={item.titleId} id={item.id} title={item.title} language={item.language} resolution={item.resolution} price="Negotiated" qcStatus={item.qcStatus} onLicense={() => handleLicense(item)} />)}</div>}</main>
      </div>
      {selectedAsset && <CrayonsBridgeLicenseRequest titleId={selectedAsset.titleId} title={selectedAsset.title} onClose={() => setSelectedAsset(null)} onSubmitted={() => setSelectedAsset(null)} />}
      <style>{`
        .marketplace-container{max-width:1400px;margin:0 auto}.marketplace-header{display:flex;flex-direction:column;gap:30px;margin-bottom:20px}@media(min-width:768px){.marketplace-header{flex-direction:row;justify-content:space-between;align-items:flex-end}}.eyebrow{color:var(--royal-gold);font-size:.68rem;font-weight:700;letter-spacing:.25em;margin-bottom:10px}.header-info h1{font-size:2.5rem;margin-bottom:8px}.header-info p{color:var(--studio-silver-muted);font-size:.9rem;letter-spacing:.5px}.search-bar{background:var(--glass-surface);border:1px solid var(--glass-border);padding:12px 20px;border-radius:8px;display:flex;align-items:center;gap:12px;width:100%;max-width:400px}.search-icon{color:var(--royal-gold)}.search-bar input{background:transparent;border:none;color:white;width:100%;outline:none;font-size:.9rem}.status-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}.status-pill{border:1px solid var(--glass-border);background:rgba(255,255,255,.03);border-radius:999px;padding:7px 10px;color:var(--studio-silver-muted);font-size:.68rem;letter-spacing:.12em}.marketplace-error{margin-bottom:24px;border:1px solid rgba(248,113,113,.25);background:rgba(248,113,113,.05);color:#fca5a5;padding:12px 14px;border-radius:8px;font-size:.85rem}.marketplace-layout{display:grid;grid-template-columns:1fr;gap:40px}@media(min-width:1024px){.marketplace-layout{grid-template-columns:240px 1fr}}.filters-sidebar{display:none}@media(min-width:1024px){.filters-sidebar{display:block}}.filter-group{margin-bottom:32px}.filter-group h3{font-size:.8rem;margin-bottom:16px;color:var(--royal-gold)}.filter-item{display:flex;align-items:center;gap:10px;font-size:.85rem;color:var(--studio-silver-muted);margin-bottom:10px}.assets-grid{flex:1}.grid-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;font-size:.8rem;color:var(--studio-silver-muted)}.category-toggles{display:flex;gap:12px}.category-toggles button{padding:6px 16px;border-radius:20px;border:1px solid var(--glass-border);font-size:.75rem;text-transform:uppercase;font-weight:600}.category-toggles button.active{background:var(--royal-gold);color:var(--obsidian);border-color:var(--royal-gold)}.sort-btn{display:flex;align-items:center;gap:6px;color:var(--royal-gold);background:transparent;border:0}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:30px}.empty-state{min-height:280px;border:1px dashed var(--glass-border);border-radius:16px;display:flex;gap:10px;align-items:center;justify-content:center;color:var(--studio-silver-muted);text-align:center;padding:28px}.empty-title{color:white;font-size:1rem;font-weight:700;margin-bottom:8px}.empty-copy{color:var(--studio-silver-muted);font-size:.82rem;max-width:520px;line-height:1.5}.animate-spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default Marketplace;
