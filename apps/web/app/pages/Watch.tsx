import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Film, Globe, Lock, Play, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import LicenseCheckout from '../components/LicenseCheckout';
import { supabase } from '../lib/supabase';

type TitleRow = {
  id: string; title: string; synopsis: string | null; description: string | null;
  primary_language: string | null; content_type: string | null; status: string;
  commercial_profile: Record<string, unknown> | null; metadata: Record<string, unknown> | null;
};
type RightsRow = { right_type: string; territories: string[] | null; languages: string[] | null; exclusivity: string; status: string; price_amount: number | null; currency: string };

const Watch = () => {
  const [params] = useSearchParams();
  const titleId = params.get('title') || '';
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [selected, setSelected] = useState<TitleRow | null>(null);
  const [rights, setRights] = useState<RightsRow[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [verification, setVerification] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      if (!supabase) { setError('Supabase is not configured for this deployment.'); setLoading(false); return; }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setError('Sign in is required to access the secure buyer watch surface.'); setLoading(false); return; }
      const { data: profile, error: profileError } = await supabase.from('sv_app_profiles').select('app_role,verification_status').eq('id', auth.user.id).maybeSingle();
      if (profileError) { setError(profileError.message); setLoading(false); return; }
      if (active) { setRole(profile?.app_role ?? null); setVerification(profile?.verification_status ?? null); }
      const { data: titleData, error: titleError } = await supabase.from('sv_app_titles').select('id,title,synopsis,description,primary_language,content_type,status,commercial_profile,metadata').in('status', ['approved', 'ready_for_distribution']).order('created_at', { ascending: false });
      if (titleError) { setError(titleError.message); setLoading(false); return; }
      const available = (titleData ?? []) as TitleRow[];
      if (active) { setTitles(available); setSelected(available.find((row) => row.id === titleId) ?? available[0] ?? null); setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [titleId]);

  useEffect(() => {
    let active = true;
    const loadRights = async () => {
      if (!selected || !supabase) return;
      const { data, error: rightsError } = await supabase.from('sv_title_rights').select('right_type,territories,languages,exclusivity,status,price_amount,currency').eq('title_id', selected.id).in('status', ['available', 'reserved']).order('created_at', { ascending: true });
      if (rightsError) { if (active) setError(rightsError.message); return; }
      const rows = (data ?? []) as RightsRow[];
      const profile = selected.commercial_profile ?? {}; const metadata = selected.metadata ?? {};
      const fallback = Number(profile.price ?? profile.license_price ?? metadata.price ?? 0);
      const preferred = Number(rows.find((row) => Number(row.price_amount ?? 0) > 0)?.price_amount ?? 0);
      if (active) { setRights(rows); setSelectedPrice(Number.isFinite(preferred) && preferred > 0 ? preferred : Number.isFinite(fallback) ? fallback : 0); }
    };
    void loadRights();
    return () => { active = false; };
  }, [selected]);

  const titleSummary = useMemo(() => {
    if (!selected) return null;
    const metadata = selected.metadata ?? {};
    return { resolution: String(metadata.resolution ?? 'MASTER'), runtime: String(metadata.runtime ?? metadata.duration ?? 'Feature / Long-form'), poster: typeof metadata.poster_url === 'string' ? metadata.poster_url : typeof metadata.thumbnail === 'string' ? metadata.thumbnail : '' };
  }, [selected]);

  const isVerifiedBuyer = role === 'buyer' && ['verified', 'approved'].includes(String(verification || '').toLowerCase());
  const selectTitle = (id: string) => { const next = titles.find((row) => row.id === id); if (next) { setSelected(next); const url = new URL(window.location.href); url.searchParams.set('title', next.id); window.history.replaceState({}, '', url.toString()); } };

  if (!supabase || (error && !selected && !titles.length)) return <div className="watch-page"><div className="watch-panel"><div className="eyebrow">STREAMVISTA · SECURE WATCH</div><h1>Secure title access</h1><p className="muted">{error || 'Secure watch is unavailable.'}</p><Link to="/crayons-bridge" className="primary-link">Open Crayons Bridge</Link></div><style>{styles}</style></div>;

  return <div className="watch-page">
    <header className="watch-topbar"><div><div className="eyebrow">CRAYONS BRIDGE · SECURE WATCH</div><h1>Buyer Screening Room</h1><p className="muted">Verified catalog access, rights context and a direct path to licensing.</p></div><div className="top-actions"><span className="status-pill">{role ? `ROLE · ${role.toUpperCase()}` : 'AUTHENTICATED'}</span><Link to="/crayons-bridge" className="ghost-link">Back to Bridge</Link></div></header>
    {error && <div className="error-banner">{error}</div>}
    {loading ? <div className="watch-panel loading">Loading verified catalog…</div> : !selected ? <div className="watch-panel"><Film size={40} /><h2>No commercially ready title yet</h2><p className="muted">Only approved or ready-for-distribution titles appear here.</p></div> : <div className="watch-layout">
      <aside className="catalog-panel"><div className="panel-label">LIVE CATALOG</div><div className="catalog-list">{titles.map((item) => <button type="button" key={item.id} onClick={() => selectTitle(item.id)} className={`catalog-item ${selected.id === item.id ? 'active' : ''}`}><span className="catalog-dot">●</span><span className="catalog-copy"><strong>{item.title}</strong><span>{item.primary_language || 'GLOBAL'} · {item.content_type || 'CONTENT'}</span></span></button>)}</div></aside>
      <main className="screening-panel"><section className="hero-card"><div className="poster-frame">{titleSummary?.poster ? <img src={titleSummary.poster} alt="" /> : <div className="poster-placeholder"><Film size={54} /></div>}<div className="play-badge"><Play fill="currentColor" size={20} /></div><div className="secure-overlay"><Lock size={14} /> SCREENING COPY</div></div><div className="title-copy"><div className="title-tags"><span className="tag"><CheckCircle2 size={12} /> APPROVED</span><span className="tag"><ShieldCheck size={12} /> RIGHTS CONTROLLED</span></div><h2>{selected.title}</h2><p>{selected.synopsis || selected.description || 'Professional buyer screening surface for verified StreamVista catalog content.'}</p><div className="meta-row"><span><Globe size={14} /> {selected.primary_language || 'GLOBAL'}</span><span>{titleSummary?.resolution}</span><span>{titleSummary?.runtime}</span></div></div></section>
      <section className="commerce-grid"><div className="rights-card"><div className="panel-label">LICENSING PROFILE</div>{rights.length ? rights.map((right, index) => <div className="rights-row" key={`${right.right_type}-${index}`}><div><strong>{right.right_type}</strong><span>{right.territories?.join(', ') || 'Territory subject to agreement'} · {right.exclusivity || 'non-exclusive'}</span></div>{Number(right.price_amount ?? 0) > 0 && <b>₹{Number(right.price_amount).toLocaleString('en-IN')}</b>}</div>) : <p className="muted">Commercial rights are configured on the title. Final license terms are confirmed inside the deal flow.</p>}</div>
      <div className="buy-card"><div className="panel-label">LICENSE THIS TITLE</div><div className="price-line"><span>License price</span><strong>{selectedPrice > 0 ? `₹${selectedPrice.toLocaleString('en-IN')}` : 'On request'}</strong></div><p className="muted">Pricing is read from the canonical title/deal record. Razorpay starts only after buyer verification.</p>{!isVerifiedBuyer ? <div className="gated"><ShieldCheck size={18} /><div><strong>Verified buyer access required</strong><span>Sign in as an approved buyer to continue to secure licensing.</span></div><Link to="/login" className="primary-link">Sign in</Link></div> : selectedPrice <= 0 ? <div className="gated"><ShieldCheck size={18} /><div><strong>Commercial terms not published</strong><span>Request terms through Crayons Bridge.</span></div><Link to="/crayons-bridge" className="primary-link">Request terms</Link></div> : <button type="button" className="license-cta" onClick={() => setCheckoutOpen(true)}>License securely <Lock size={15} /></button>}</div></section></main>
    </div>}
    {checkoutOpen && <LicenseCheckout assetId={selected?.id || ''} title={selected?.title || ''} price={selectedPrice} onSuccess={() => setCheckoutOpen(false)} onClose={() => setCheckoutOpen(false)} />}
    <style>{styles}</style>
  </div>;
};

const styles = `.watch-page{min-height:100vh;background:#050607;color:#fff;padding:32px 4vw 64px}.watch-topbar{max-width:1480px;margin:0 auto 24px;display:flex;justify-content:space-between;gap:28px;align-items:flex-end}.eyebrow{color:var(--royal-gold,#d4af37);font-size:.68rem;font-weight:700;letter-spacing:.22em}.watch-topbar h1,.watch-panel h1{font-size:clamp(2rem,4vw,3.4rem);margin:8px 0}.muted{color:#8f949d;line-height:1.65}.top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.status-pill,.tag{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:8px 12px;color:#a6abb3;font-size:.68rem;letter-spacing:.08em}.ghost-link,.primary-link{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;border-radius:999px;padding:11px 15px;font-size:.8rem;font-weight:700}.ghost-link{border:1px solid rgba(255,255,255,.12);color:#ddd}.primary-link{background:#d4af37;color:#08090a}.error-banner{max-width:1480px;margin:0 auto 18px;padding:12px 14px;border-radius:10px;border:1px solid rgba(248,113,113,.25);background:rgba(248,113,113,.06);color:#fca5a5}.watch-layout{max-width:1480px;margin:0 auto;display:grid;grid-template-columns:250px 1fr;gap:20px}.catalog-panel,.screening-panel,.watch-panel{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);border-radius:18px}.catalog-panel{padding:18px;height:fit-content}.panel-label{font-size:.66rem;letter-spacing:.2em;color:#747985;font-weight:700;margin-bottom:14px}.catalog-list{display:flex;flex-direction:column;gap:6px}.catalog-item{width:100%;display:flex;gap:10px;text-align:left;padding:12px;border-radius:11px;background:transparent;border:1px solid transparent;color:#fff;cursor:pointer}.catalog-item.active{background:rgba(255,255,255,.05);border-color:rgba(212,175,55,.35)}.catalog-dot{color:#555}.catalog-item.active .catalog-dot{color:#d4af37}.catalog-copy{display:flex;flex-direction:column;gap:4px;min-width:0}.catalog-copy strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.catalog-copy span{font-size:.72rem;color:#7f848c}.screening-panel{padding:18px}.hero-card{display:grid;grid-template-columns:minmax(320px,.9fr) 1.1fr;gap:24px;align-items:center}.poster-frame{height:420px;border-radius:14px;overflow:hidden;position:relative;background:#111}.poster-frame img{width:100%;height:100%;object-fit:cover}.poster-placeholder{height:100%;display:grid;place-items:center;color:#3a3d42}.play-badge{position:absolute;inset:0;margin:auto;width:64px;height:64px;display:grid;place-items:center;border-radius:50%;background:rgba(0,0,0,.55);color:#d4af37}.secure-overlay{position:absolute;left:12px;bottom:12px;display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.6);font-size:.68rem;color:#d8d8d8}.title-tags{display:flex;gap:8px;flex-wrap:wrap}.tag{color:#a7d8bf}.title-copy h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1.02;margin:16px 0}.title-copy p{font-size:1rem;max-width:720px;color:#9da2aa;line-height:1.75}.meta-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.meta-row span{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.08);color:#aaa;font-size:.72rem}.commerce-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;margin-top:18px}.rights-card,.buy-card{padding:20px;border-radius:14px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07)}.rights-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.06)}.rights-row:last-child{border-bottom:0}.rights-row div{display:flex;flex-direction:column;gap:5px}.rights-row span{font-size:.74rem;color:#7e838c}.rights-row b{color:#d4af37;white-space:nowrap}.price-line{display:flex;justify-content:space-between;gap:20px;align-items:end;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:15px;margin-bottom:15px}.price-line span{color:#858a93;font-size:.8rem}.price-line strong{font-size:1.8rem;color:#d4af37}.gated{display:flex;gap:10px;align-items:flex-start;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-top:14px;color:#a6abb3}.gated>div{display:flex;flex-direction:column;gap:4px;flex:1}.gated strong{color:#fff;font-size:.8rem}.gated span{font-size:.73rem;line-height:1.45}.license-cta{width:100%;margin-top:16px;border:0;border-radius:10px;padding:14px;background:#d4af37;color:#08090a;font-weight:800;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}.watch-panel{max-width:760px;margin:60px auto;padding:40px;text-align:center}.loading{color:#9ca1a9}@media(max-width:980px){.watch-layout,.commerce-grid,.hero-card{grid-template-columns:1fr}.catalog-panel{order:2}.hero-card{gap:18px}.poster-frame{height:360px}.watch-topbar{flex-direction:column;align-items:flex-start}}@media(max-width:620px){.watch-page{padding:20px 14px 40px}.screening-panel{padding:12px}.poster-frame{height:300px}.watch-topbar h1{font-size:2.25rem}}`;

export default Watch;
