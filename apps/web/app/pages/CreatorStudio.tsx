import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type TitleRow = {
  id: string;
  title?: string | null;
  primary_language?: string | null;
  year?: number | string | null;
  status?: string | null;
  synopsis?: string | null;
};

const ASSET_KINDS = ['poster', 'trailer', 'film', 'subs'] as const;
type AssetKind = (typeof ASSET_KINDS)[number];

function titleLabel(row: TitleRow) {
  return row.title || row.id;
}

export default function CreatorStudio() {
  const [tab, setTab] = useState<'titles' | 'create' | 'assets'>('titles');
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [vault, setVault] = useState<'checking' | 'available' | 'unavailable'>('checking');

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Malayalam');
  const [synopsis, setSynopsis] = useState('');

  const [selectedTitleId, setSelectedTitleId] = useState('');
  const [assetKind, setAssetKind] = useState<AssetKind>('poster');
  const [assetFile, setAssetFile] = useState<File | null>(null);

  const refreshTitles = useCallback(async () => {
    setLoadError('');
    setVault('checking');
    if (!supabase) {
      setLoadError('Supabase is not configured.');
      setVault('unavailable');
      return;
    }

    const { data, error } = await supabase
      .from('sv_app_titles')
      .select('id,title,primary_language,status,synopsis')
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

    // The bucket is known to be private and provisioned server-side. Avoid client-side
    // listBuckets(), which requires bucket-administration privileges and can falsely report
    // the vault as unavailable to an authenticated creator.
    setVault('available');
  }, []);

  useEffect(() => {
    void refreshTitles();
  }, [refreshTitles]);

  const createTitle = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!supabase) { setMessage('Supabase is not configured.'); return; }
    if (!name.trim()) { setMessage('Title name is required.'); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Session expired. Sign in again.'); return; }

    setBusy(true);
    const { data, error } = await supabase
      .from('sv_app_titles')
      .insert({
        title: name.trim(),
        primary_language: language.trim() || null,
        synopsis: synopsis.trim() || null,
        status: 'draft',
        creator_id: user.id,
      })
      .select('id,title,primary_language,status,synopsis')
      .single();
    setBusy(false);

    if (error) { setMessage(`Create failed: ${error.message}`); return; }
    setName('');
    setSynopsis('');
    setSelectedTitleId(data?.id || '');
    setMessage('Title saved as draft.');
    setTab('titles');
    await refreshTitles();
  };

  const uploadAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!supabase) { setMessage('Supabase is not configured.'); return; }
    if (!selectedTitleId) { setMessage('Create or select a title before uploading assets.'); return; }
    if (!assetFile) { setMessage('Select a file first.'); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage('Session expired. Sign in again.'); return; }

    setBusy(true);
    // Storage RLS is title-scoped: {titleId}/{kind}/{filename}.
    const safeName = assetFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${selectedTitleId}/${assetKind}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from('streamvista-films')
      .upload(path, assetFile, { upsert: false, contentType: assetFile.type || undefined });
    setBusy(false);

    if (error) { setMessage(`Upload failed: ${error.message}`); return; }
    setAssetFile(null);
    setMessage(`${assetKind} stored securely in the private vault.`);
  };

  return (
    <div className="mx-auto max-w-5xl p-8 text-zinc-100">
      <h1 className="text-3xl font-semibold">Creator workspace</h1>
      <p className="mt-2 text-sm text-zinc-400">Titles, metadata and private vault assets. No mock metrics.</p>
      <p className="mt-2 text-xs text-zinc-500">Vault: {vault}</p>

      <div className="mt-6 flex gap-2">
        {(['titles', 'create', 'assets'] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === id ? 'bg-cyan-500 text-black' : 'border border-white/10 bg-white/5'
            }`}
          >
            {id === 'titles' ? 'Titles' : id === 'create' ? 'New title' : 'Assets'}
          </button>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-cyan-300" role="status">{message}</p>}
      {loadError && <p className="mt-4 text-sm text-red-400">{loadError}</p>}

      {tab === 'titles' && (
        <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10">
          {titles.length === 0 && !loadError && (
            <p className="p-6 text-zinc-400">No titles yet. Create your first title.</p>
          )}
          {titles.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedTitleId(row.id)}
              className={`flex w-full items-center justify-between p-4 text-left ${selectedTitleId === row.id ? 'bg-white/5' : ''}`}
            >
              <div>
                <div className="font-medium">{titleLabel(row)}</div>
                <div className="text-xs text-zinc-500">
                  {[row.primary_language, row.status || 'draft'].filter(Boolean).join(' · ')}
                </div>
              </div>
              {selectedTitleId === row.id && <span className="text-xs text-cyan-300">Selected</span>}
            </button>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <form onSubmit={createTitle} className="mt-6 max-w-lg space-y-4">
          <input className="w-full rounded-lg bg-black/40 p-3" placeholder="Title name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-lg bg-black/40 p-3" placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
          <textarea className="w-full rounded-lg bg-black/40 p-3" placeholder="Synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
          <button disabled={busy} className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black">
            {busy ? 'Saving…' : 'Save draft'}
          </button>
        </form>
      )}

      {tab === 'assets' && (
        <form onSubmit={uploadAsset} className="mt-6 max-w-lg space-y-4">
          <select
            value={selectedTitleId}
            onChange={(e) => setSelectedTitleId(e.target.value)}
            className="w-full rounded-lg bg-black/40 p-3"
          >
            <option value="">Select a title</option>
            {titles.map((title) => <option key={title.id} value={title.id}>{titleLabel(title)}</option>)}
          </select>

          <div className="flex flex-wrap gap-2">
            {ASSET_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setAssetKind(kind)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  assetKind === kind ? 'bg-cyan-500 text-black' : 'border border-white/10'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <input type="file" onChange={(e) => setAssetFile(e.target.files?.[0] ?? null)} />
          <p className="text-xs text-zinc-500">Private vault: streamvista-films / {'{titleId}/{kind}/'}. QC submission is not auto-approved.</p>
          <button disabled={busy} className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black">
            {busy ? 'Uploading…' : `Upload ${assetKind}`}
          </button>
        </form>
      )}
    </div>
  );
}