import React, { useEffect, useMemo, useState } from 'react';
import StreamPlayer from '../components/StreamPlayer';
import { supabase } from '../lib/supabase';

type TitleRow = { id: string; title: string; status: string | null; metadata: Record<string, unknown> | null };
type StreamRecord = { id: string; title_id: string; asset_path: string; manifest_url: string | null; playback_status: string; visibility: string; created_at: string };

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'application/x-mpegURL', 'application/vnd.apple.mpegurl'];

export default function StreamingCMS() {
  const [titles, setTitles] = useState<TitleRow[]>([]);
  const [streams, setStreams] = useState<StreamRecord[]>([]);
  const [titleId, setTitleId] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => titles.find((item) => item.id === titleId) || null, [titles, titleId]);

  async function load() {
    setStatus('');
    if (!supabase) { setStatus('Supabase is not configured.'); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setStatus('Login required.'); return; }
    const { data, error } = await supabase.from('sv_app_titles').select('id,title,status,metadata').eq('creator_id', auth.user.id).order('created_at', { ascending: false }).limit(100);
    if (error) { setStatus(error.message); return; }
    const nextTitles = (data || []) as TitleRow[];
    setTitles(nextTitles);
    setTitleId((current) => current || nextTitles[0]?.id || '');
    const { data: streamData } = await supabase.from('sv_stream_assets').select('id,title_id,asset_path,manifest_url,playback_status,visibility,created_at').eq('owner_id', auth.user.id).order('created_at', { ascending: false }).limit(100);
    setStreams((streamData || []) as StreamRecord[]);
  }

  useEffect(() => { void load(); }, []);

  async function upload() {
    if (!supabase || !selected || !file) return setStatus('Select a title and video file.');
    if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !/\.(mp4|webm|mov|m3u8)$/i.test(file.name)) return setStatus('Unsupported video format. Use MP4, WebM, MOV or HLS manifest.');
    if (file.size > 2 * 1024 * 1024 * 1024) return setStatus('File exceeds the 2 GB CMS upload limit.');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setStatus('Login required.');
    setBusy(true); setStatus('Uploading to private media storage…');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${selected.id}/stream/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from('streamvista-films').upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) { setBusy(false); setStatus(`Upload failed: ${error.message}`); return; }
    const { error: insertError } = await supabase.from('sv_stream_assets').insert({ title_id: selected.id, owner_id: auth.user.id, asset_path: path, playback_status: file.name.toLowerCase().endsWith('.m3u8') ? 'ready' : 'uploaded', visibility: 'private' });
    setBusy(false);
    if (insertError) { setStatus(`Metadata save failed: ${insertError.message}`); return; }
    setFile(null); setStatus('Video uploaded to the private streaming vault. Transcode/QC can promote it to playback-ready.');
    await load();
  }

  async function addManifest() {
    if (!supabase || !selected || !streamUrl.trim()) return setStatus('Select a title and enter an HLS manifest URL.');
    if (!/^https:\/\//i.test(streamUrl.trim())) return setStatus('Manifest URL must use HTTPS.');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setStatus('Login required.');
    setBusy(true);
    const { error } = await supabase.from('sv_stream_assets').insert({ title_id: selected.id, owner_id: auth.user.id, asset_path: 'external', manifest_url: streamUrl.trim(), playback_status: 'ready', visibility: 'private' });
    setBusy(false);
    if (error) { setStatus(`Manifest save failed: ${error.message}`); return; }
    setStreamUrl(''); setStatus('HLS manifest registered.'); await load();
  }

  const playable = streams.find((item) => item.title_id === titleId && item.playback_status === 'ready' && item.manifest_url);

  return <main className="min-h-screen bg-[#050607] text-white"><div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
    <div className="flex flex-col gap-3 border-b border-white/10 pb-7"><div className="text-xs font-semibold tracking-[0.28em] text-cyan-300/70">STREAMVISTA · STREAMING CMS</div><h1 className="text-4xl font-semibold tracking-tight">Upload → QC → HLS → Deliver</h1><p className="max-w-3xl text-sm leading-6 text-white/40">Central media control for creator uploads, playback manifests and secure delivery. Assets remain private until the title is approved for distribution.</p></div>
    {status && <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65" role="status">{status}</div>}
    <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Content</div><h2 className="mt-2 text-xl font-semibold">Choose title</h2><select value={titleId} onChange={(e) => setTitleId(e.target.value)} className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none">{titles.length ? titles.map((item) => <option value={item.id} key={item.id}>{item.title}</option>) : <option value="">No titles</option>}</select>
        <div className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/30">Upload master / playback asset</div><input type="file" accept="video/*,.m3u8" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-4 block w-full text-sm text-white/60" /><button disabled={busy || !file} onClick={() => void upload()} className="mt-5 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-black disabled:opacity-40">{busy ? 'Processing…' : 'Upload video'}</button>
        <div className="my-7 border-t border-white/10" />
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Register external HLS</div><input value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://cdn.example.com/title/master.m3u8" className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/20" /><button disabled={busy || !streamUrl.trim()} onClick={() => void addManifest()} className="mt-3 w-full rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Save HLS manifest</button>
      </div>
      <div className="space-y-6"><div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Playback preview</div><h2 className="mt-2 text-xl font-semibold">{selected?.title || 'Select a title'}</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.15em] text-white/40">PRIVATE</span></div><div className="mt-5">{playable ? <StreamPlayer src={playable.manifest_url} title={selected?.title || 'Stream'} /> : <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/10 bg-black/30 text-center text-sm text-white/30">No playback-ready HLS manifest for this title yet.</div>}</div></div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Delivery records</div><div className="mt-4 divide-y divide-white/10">{streams.filter((item) => item.title_id === titleId).length ? streams.filter((item) => item.title_id === titleId).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4"><div><div className="text-sm font-medium">{item.manifest_url ? 'HLS manifest' : item.asset_path.split('/').pop()}</div><div className="mt-1 text-xs text-white/30">{item.playback_status} · {item.visibility}</div></div><span className="text-xs text-white/35">{new Date(item.created_at).toLocaleDateString()}</span></div>) : <div className="py-8 text-sm text-white/30">No media records for this title.</div>}</div></div>
      </div>
    </section>
  </div></main>;
}
