import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type TitleRow = {
  id: string;
  title?: string | null;
  primary_language?: string | null;
  status?: string | null;
  synopsis?: string | null;
  description?: string | null;
  content_type?: string | null;
};

const ASSET_KINDS = ['poster', 'trailer', 'film', 'subs'] as const;
type AssetKind = (typeof ASSET_KINDS)[number];

const PIPELINE = [
  ['draft', 'Draft'],
  ['submitted', 'Submitted'],
  ['qc_pending', 'QC'],
  ['legal_pending', 'Rights'],
  ['ready_for_distribution', 'Distribution'],
] as const;

function titleLabel(row: TitleRow) {
  return row.title || row.id;
}

function stageLabel(status: string | null | undefined) {
  return PIPELINE.find(([key]) => key === status)?.[1] || (status ? status.replaceAll('_', ' ') : 'Draft');
}

export default function CreatorStudio() {
  const [tab, setTab] = useState<'titles' | 'create' | 'assets'>('titles');
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [vault, setVault] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [profileRole, setProfileRole] = useState<string>('');

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Malayalam');
  const [contentType, setContentType] = useState('Feature film');
  const [synopsis, setSynopsis] = useState('');
  const [description, setDescription] = useState('');

  const [selectedTitleId, setSelectedTitleId] = useState('');
  const [assetKind, setAssetKind] = useState<AssetKind>('poster');
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const selectedTitle = useMemo(() => titles.find((title) => title.id === selectedTitleId) || null, [selectedTitleId, titles]);

  const refreshTitles = useCallback(async () => {
    setLoadError('');
    setVault('checking');
    if (!supabase) {
      setLoadError('Supabase is not configured.');
      setVault('unavailable');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setTitles([]);
      setLoadError('Session expired. Please sign in again.');
      setVault('unavailable');
      return;
    }
    const { data: profile } = await supabase.from('sv_app_profiles').select('app_role').eq('id', user.id).maybeSingle();
    setProfileRole(profile?.app_role || '');
    const { data, error } = await supabase
      .from('sv_app_titles')
      .select('id,title,primary_language,status,synopsis,description,content_type')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      setTitles([]);
      setLoadError(error.message);
      setVault('unavailable');
      return;
    }
    const rows = (data as TitleRow[]) || [];
    setTitles(rows);
    setSelectedTitleId((current) => current || rows[0]?.id || '');
    setVault('available');
  }, []);

  useEffect(() => { void refreshTitles(); }, [refreshTitles]);

  const createTitle = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!supabase) { setMessage('Supabase is not configured.'); return; }
    if (!name.trim()) { setMessage('Title name is required.'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Session expired. Sign in again.'); return; }
    setBusy(true);
    const { data, error } = await supabase.from('sv_app_titles').insert({
      title: name.trim(),
      primary_language: language.trim() || null,
      content_type: contentType.trim() || null,
      synopsis: synopsis.trim() || null,
      description: description.trim() || null,
      status: 'draft',
      creator_id: user.id,
    }).select('id,title,primary_language,status,synopsis,description,content_type').single();
    setBusy(false);
    if (error) { setMessage(`Create failed: ${error.message}`); return; }
    setName(''); setSynopsis(''); setDescription(''); setSelectedTitleId(data?.id || '');
    setMessage('Draft saved to your private workspace.');
    setTab('titles');
    await refreshTitles();
  };

  const uploadAsset = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    if (!supabase) { setMessage('Supabase is not configured.'); return; }
    if (!selectedTitleId) { setMessage('Create or select a title before uploading assets.'); return; }
    if (!assetFile) { setMessage('Select a file first.'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Session expired. Sign in again.'); return; }
    setBusy(true);
    const safeName = assetFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${selectedTitleId}/${assetKind}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from('streamvista-films').upload(path, assetFile, { upsert: false, contentType: assetFile.type || undefined });
    setBusy(false);
    if (error) { setMessage(`Upload failed: ${error.message}`); return; }
    setAssetFile(null); setMessage(`${assetKind} stored securely in the private vault.`);
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-cyan-300">CREATOR WORKSPACE</div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Your studio, from draft to release.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Keep titles, metadata, rights workflow and private vault assets together. No mock metrics. Every status reflects the production record.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><div className="text-[10px] uppercase tracking-[0.18em] text-white/30">Titles</div><div className="mt-1 text-2xl font-semibold">{titles.length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><div className="text-[10px] uppercase tracking-[0.18em] text-white/30">Vault</div><div className="mt-1 text-sm font-semibold text-cyan-300">{vault === 'available' ? 'Available' : vault === 'checking' ? 'Checking' : 'Unavailable'}</div></div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:col-span-1"><div className="text-[10px] uppercase tracking-[0.18em] text-white/30">Role</div><div className="mt-1 text-sm font-semibold capitalize">{profileRole || 'Authenticated user'}</div></div>
          </div>
        </div>

        {(message || loadError) && <div className={`mt-6 rounded-2xl border p-4 text-sm ${loadError ? 'border-red-400/20 bg-red-400/5 text-red-300' : 'border-cyan-400/20 bg-cyan-400/5 text-cyan-200'}`} role={loadError ? 'alert' : 'status'}>{loadError || message}</div>}

        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2">
          {(['titles', 'create', 'assets'] as const).map((id) => <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === id ? 'bg-white text-black' : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}`}>{id === 'titles' ? 'My titles' : id === 'create' ? 'New title' : 'Private vault'}</button>)}
        </div>

        {tab === 'titles' && <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 md:p-7">
            <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Your catalogue</h2><p className="mt-1 text-sm text-white/35">Select a title to review its production path.</p></div><button type="button" onClick={() => setTab('create')} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300">+ New title</button></div>
            <div className="mt-6 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
              {titles.length === 0 && !loadError && <div className="p-8 text-sm text-white/35">No titles yet. Start with your first real project.</div>}
              {titles.map((row) => <button key={row.id} type="button" onClick={() => setSelectedTitleId(row.id)} className={`flex w-full items-center justify-between gap-4 p-5 text-left transition ${selectedTitleId === row.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'}`}><div className="min-w-0"><div className="truncate font-medium">{titleLabel(row)}</div><div className="mt-1 text-xs text-white/35">{[row.content_type, row.primary_language, stageLabel(row.status)].filter(Boolean).join(' · ')}</div></div>{selectedTitleId === row.id && <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300">Selected</span>}</button>)}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-cyan-400/[0.06] to-transparent p-5 md:p-7"><div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">Production path</div><h2 className="mt-2 text-2xl font-semibold">{selectedTitle ? titleLabel(selectedTitle) : 'Select a title'}</h2><p className="mt-2 text-sm text-white/40">{selectedTitle?.synopsis || 'Your workflow will appear here once a title is created.'}</p><div className="mt-8 space-y-3">{PIPELINE.map(([key, label], index) => { const activeIndex = Math.max(0, PIPELINE.findIndex(([status]) => status === selectedTitle?.status)); const current = selectedTitle?.status === key; const reached = Boolean(selectedTitle) && index <= activeIndex; return <div key={key} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-semibold ${current ? 'bg-cyan-400 text-black' : reached ? 'bg-white/10 text-white' : 'bg-white/5 text-white/25'}`}>{String(index + 1).padStart(2, '0')}</div><div className="flex-1"><div className={`text-sm font-semibold ${reached ? 'text-white' : 'text-white/30'}`}>{label}</div><div className="mt-0.5 text-xs text-white/25">{current ? 'Current state' : reached ? 'Reached' : 'Not reached'}</div></div></div>; })}</div></div>
        </section>}

        {tab === 'create' && <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={createTitle} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8"><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Start a production record</div><h2 className="mt-2 text-2xl font-semibold">Create your first title</h2><p className="mt-2 text-sm text-white/40">This creates a real draft in the StreamVista production data layer under your authenticated account.</p><div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Title name</span><input required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none placeholder:text-white/20 focus:border-cyan-400/40" placeholder="e.g. The Last Monsoon" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Language</span><input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none focus:border-cyan-400/40" value={language} onChange={(e) => setLanguage(e.target.value)} /></label>
            <label><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Content type</span><select className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none focus:border-cyan-400/40" value={contentType} onChange={(e) => setContentType(e.target.value)}><option>Feature film</option><option>Series</option><option>Documentary</option><option>Short film</option><option>Music / Performance</option><option>Other visual content</option></select></label>
            <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Synopsis</span><textarea rows={5} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none focus:border-cyan-400/40" placeholder="A concise buyer-facing synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} /></label>
            <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Internal description</span><textarea rows={4} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none focus:border-cyan-400/40" placeholder="Optional production notes, positioning or metadata context" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          </div><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><span className="text-xs text-white/30">Status on create: Draft. QC and rights remain explicit gates.</span><button type="submit" disabled={busy} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Saving…' : 'Save draft'}</button></div></form>
          <aside className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8"><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">What happens next</div><div className="mt-6 space-y-4">{['Metadata record','Private asset vault','QC / rights review','Commercial readiness','Crayons Bridge distribution'].map((item, index) => <div key={item} className="flex gap-3"><span className="text-xs text-cyan-300/70">0{index + 1}</span><span className="text-sm text-white/65">{item}</span></div>)}</div></aside>
        </section>}

        {tab === 'assets' && <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8"><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Private vault</div><h2 className="mt-2 text-2xl font-semibold">Secure project assets</h2><p className="mt-2 text-sm leading-6 text-white/40">Assets are stored in the private <code className="text-cyan-300">streamvista-films</code> bucket and are never auto-approved for QC.</p><form onSubmit={uploadAsset} className="mt-7 space-y-5"><label><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Title</span><select value={selectedTitleId} onChange={(e) => setSelectedTitleId(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 outline-none focus:border-cyan-400/40"><option value="">Select a title</option>{titles.map((title) => <option key={title.id} value={title.id}>{titleLabel(title)}</option>)}</select></label><div><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-white/35">Asset type</span><div className="flex flex-wrap gap-2">{ASSET_KINDS.map((kind) => <button key={kind} type="button" onClick={() => setAssetKind(kind)} className={`rounded-full px-3.5 py-2 text-xs font-semibold ${assetKind === kind ? 'bg-cyan-400 text-black' : 'border border-white/10 text-white/45 hover:text-white'}`}>{kind}</button>)}</div></div><label className="block rounded-2xl border border-dashed border-white/15 bg-black/20 p-5"><span className="block text-sm font-medium">Choose a file</span><span className="mt-1 block text-xs text-white/30">Poster, trailer, film master or subtitles.</span><input type="file" className="mt-4 block w-full text-sm text-white/55" onChange={(e) => setAssetFile(e.target.files?.[0] ?? null)} /></label><button type="submit" disabled={busy} className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Uploading…' : `Upload ${assetKind}`}</button></form></div><div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 md:p-8"><div className="flex items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Selected title</div><h2 className="mt-2 text-xl font-semibold">{selectedTitle ? titleLabel(selectedTitle) : 'None selected'}</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/40">{selectedTitle ? stageLabel(selectedTitle.status) : 'Ready'}</span></div><div className="mt-8 grid gap-3 sm:grid-cols-2">{ASSET_KINDS.map((kind) => <div key={kind} className="rounded-2xl border border-white/10 bg-black/20 p-5"><div className="text-sm font-semibold capitalize">{kind}</div><div className="mt-1 text-xs text-white/30">Upload to your private vault</div></div>)}</div><div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5 text-sm text-white/45">QC submission is a separate operational gate. Uploading an asset never marks the title approved.</div></div></section>}
      </div>
    </main>
  );
}
