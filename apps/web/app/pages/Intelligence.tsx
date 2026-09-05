import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type DataStatus = 'verified' | 'operator-estimated' | 'ai-derived' | 'unknown';

type VersionInput = {
  id?: string;
  name: string;
  format?: string;
  languages: string[];
  revenue: number | null;
  share: number | null;
  dataStatus: DataStatus;
};

type Project = {
  id: string;
  title: string;
  genre?: string | null;
  runtime?: number | null;
  language?: string | null;
  productionStatus?: string | null;
  rightsStatus?: string | null;
};

function authHeaders() {
  return supabase?.auth.getSession().then(({ data }) => data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}) ?? Promise.resolve({});
}

export default function Intelligence() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [objective, setObjective] = useState('maximize realistic multi-version yield');
  const [versions, setVersions] = useState<VersionInput[]>([
    { name: 'Primary master', format: 'Theatrical / SVOD', languages: ['Malayalam'], revenue: null, share: null, dataStatus: 'unknown' },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('sv_app_titles').select('id,title,primary_language,status,metadata,commercial_profile').order('created_at', { ascending: false }).limit(100);
      const list = (data || []).map((row: any) => ({ id: row.id, title: row.title, language: row.primary_language, productionStatus: row.status, genre: row.metadata?.genre ?? null, runtime: row.metadata?.runtime ?? null, rightsStatus: row.metadata?.rightsStatus ?? null }));
      setProjects(list);
      if (list[0]) setProjectId(list[0].id);
    };
    void load();
  }, []);

  const updateVersion = (index: number, patch: Partial<VersionInput>) => setVersions((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const addVersion = () => setVersions((items) => [...items, { name: `Version ${items.length + 1}`, format: '', languages: [], revenue: null, share: null, dataStatus: 'unknown' }]);
  const removeVersion = (index: number) => setVersions((items) => items.length === 1 ? items : items.filter((_, i) => i !== index));

  const runAnalysis = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setResult(null);
    const project = projects.find((item) => item.id === projectId);
    if (!project) { setError('Select a real StreamVista project.'); setBusy(false); return; }
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          buyer: buyerName.trim() ? { name: buyerName.trim() } : undefined,
          versions,
          commercialContext: { currency: 'INR' },
          rights: {},
          operatorConstraints: {},
          analysisRequest: { objective, includePackaging: true, includeBuyerStrategy: true, includeRoiProjection: true },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.details?.join(', ') || 'Intelligence analysis failed');
      setResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Intelligence analysis failed');
    } finally { setBusy(false); }
  };

  return <div className="intel-shell">
    <header className="intel-header"><div><div className="intel-eyebrow">STREAMVISTA / INTELLIGENCE</div><h1>Data-first revenue intelligence</h1><p>Structured StreamVista facts in. Validated strategy out. Unknowns stay unknown.</p></div><div className="intel-badge">PRODUCTION DATA PATH</div></header>
    <form onSubmit={runAnalysis}>
      <section className="intel-card"><div className="intel-grid intel-grid-2">
        <label>Project<select value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
        <label>Buyer / target platform<input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Optional target buyer" /></label>
      </div>
      <label>Objective<input value={objective} onChange={(e) => setObjective(e.target.value)} /></label></section>

      <section className="intel-card"><div className="section-head"><div><div className="intel-eyebrow">VERSION INPUTS</div><h2>Commercial versions</h2></div><button type="button" onClick={addVersion}>+ Add version</button></div>
        <div className="version-list">{versions.map((version, index) => <div key={`${version.name}-${index}`} className="version-row">
          <input value={version.name} onChange={(e) => updateVersion(index, { name: e.target.value })} aria-label="Version name" placeholder="Version name" />
          <input value={version.format || ''} onChange={(e) => updateVersion(index, { format: e.target.value })} aria-label="Format" placeholder="Format / platform" />
          <input value={version.languages.join(', ')} onChange={(e) => updateVersion(index, { languages: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} aria-label="Languages" placeholder="Languages" />
          <input type="number" min="0" value={version.revenue ?? ''} onChange={(e) => updateVersion(index, { revenue: e.target.value === '' ? null : Number(e.target.value) })} aria-label="Revenue" placeholder="Revenue" />
          <input type="number" min="0" max="100" value={version.share ?? ''} onChange={(e) => updateVersion(index, { share: e.target.value === '' ? null : Number(e.target.value) })} aria-label="Revenue share" placeholder="Share %" />
          <select value={version.dataStatus} onChange={(e) => updateVersion(index, { dataStatus: e.target.value as DataStatus })} aria-label="Data status"><option value="verified">Verified</option><option value="operator-estimated">Operator-estimated</option><option value="ai-derived">AI-derived</option><option value="unknown">Unknown</option></select>
          <button type="button" onClick={() => removeVersion(index)} disabled={versions.length === 1}>Remove</button>
        </div>)}</div>
        <div className="status-legend"><span>VERIFIED</span><span>OPERATOR-ESTIMATED</span><span>AI-DERIVED</span><span>UNKNOWN</span></div>
      </section>

      <button className="run-button" disabled={busy || !projectId}>{busy ? 'Running validated analysis…' : 'Run Intelligence'}</button>
    </form>

    {error && <div className="error-card">{error}</div>}
    {result && <section className="intel-results">
      <div className="result-hero"><div><div className="intel-eyebrow">ANALYSIS RESULT</div><h2>₹{Number(result.analysis.totalYield || 0).toLocaleString('en-IN')}</h2><p>Deterministic net yield from supplied numeric inputs.</p></div><div className="audit">{result.audit.provider} · {result.audit.model}<br/>{new Date(result.audit.timestamp).toLocaleString()}</div></div>
      <div className="result-grid">
        <div className="intel-card"><div className="intel-eyebrow">REVENUE MATRIX</div>{result.analysis.versions.map((v: any) => <div key={v.name} className="matrix-row"><div><strong>{v.name}</strong><span>{v.format || 'Format unknown'} · {(v.languages || []).join(', ') || 'Language unknown'}</span></div><div><strong>{v.netYield === null ? 'UNKNOWN' : `₹${Number(v.netYield).toLocaleString('en-IN')}`}</strong><span>{v.dataStatus}</span></div></div>)}</div>
        <div className="intel-card"><div className="intel-eyebrow">AI STRATEGY</div><pre>{JSON.stringify({ packagingStrategy: result.analysis.packagingStrategy, buyerStrategy: result.analysis.buyerStrategy, recommendations: result.analysis.recommendations }, null, 2)}</pre></div>
        <div className="intel-card"><div className="intel-eyebrow">ROI / CONFIDENCE</div><pre>{JSON.stringify({ roiProjection: result.analysis.roiProjection, confidence: result.analysis.confidence, dataQuality: result.analysis.dataQuality }, null, 2)}</pre></div>
      </div>
    </section>}

    <style>{`
      .intel-shell{max-width:1280px;margin:0 auto;padding:20px;color:var(--sv-text)}
      .intel-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px}.intel-eyebrow{font-size:10px;letter-spacing:.18em;color:var(--sv-dim);text-transform:uppercase}.intel-header h1{font-size:clamp(32px,5vw,54px);margin:8px 0}.intel-header p{color:var(--sv-muted);max-width:720px;line-height:1.6}.intel-badge{border:1px solid var(--sv-border);padding:8px 10px;border-radius:999px;font-size:10px;color:var(--sv-muted);white-space:nowrap}
      .intel-card{background:rgba(255,255,255,.025);border:1px solid var(--sv-border);border-radius:16px;padding:20px;margin-bottom:16px}.intel-grid{display:grid;gap:14px}.intel-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.intel-card label{display:block;font-size:11px;color:var(--sv-muted);margin-bottom:14px}.intel-card input,.intel-card select{margin-top:7px;width:100%;box-sizing:border-box;background:#090b0c;border:1px solid var(--sv-border);color:var(--sv-text);border-radius:10px;padding:11px 12px}.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.section-head h2{margin:6px 0 0;font-size:20px}.section-head button,.version-row button{background:transparent;border:1px solid var(--sv-border);color:var(--sv-text);border-radius:9px;padding:8px 10px}.version-list{display:grid;gap:10px}.version-row{display:grid;grid-template-columns:1.2fr 1.1fr 1.1fr .7fr .6fr .8fr auto;gap:8px;align-items:center}.version-row input,.version-row select{margin:0}.status-legend{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.status-legend span{font-size:9px;padding:5px 7px;border:1px solid var(--sv-border);border-radius:999px;color:var(--sv-muted)}.run-button{width:100%;background:white;color:black;border:0;border-radius:12px;padding:14px 18px;font-weight:700;margin:4px 0 18px}.run-button:disabled{opacity:.5}.error-card{border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.06);padding:14px;border-radius:12px;color:#ffb6b6;margin-bottom:16px}.result-hero{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding:24px;border:1px solid var(--sv-border);border-radius:16px;background:rgba(255,255,255,.03);margin-bottom:16px}.result-hero h2{font-size:42px;margin:6px 0}.result-hero p,.audit,.matrix-row span{color:var(--sv-muted);font-size:12px}.audit{text-align:right}.result-grid{display:grid;gap:16px;grid-template-columns:1.2fr 1fr 1fr}.matrix-row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}.matrix-row:last-child{border-bottom:0}.matrix-row div:last-child{text-align:right}.matrix-row strong,.matrix-row span{display:block}.matrix-row span{margin-top:4px}.intel-card pre{white-space:pre-wrap;overflow:auto;font-size:11px;color:var(--sv-muted);line-height:1.55}
      @media(max-width:1050px){.version-row{grid-template-columns:1fr 1fr 1fr}.result-grid,.intel-grid-2{grid-template-columns:1fr}}@media(max-width:700px){.intel-shell{padding:12px}.intel-header,.result-hero{flex-direction:column}.audit{text-align:left}.version-row{grid-template-columns:1fr}}
    `}</style>
  </div>;
}
