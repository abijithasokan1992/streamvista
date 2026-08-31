import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Project = { id: string; name: string; logline: string | null; synopsis?: string | null; stage: string; approval_state: string; organization_id?: string };
type Row = { id: string; name?: string; title?: string; approval_state?: string; status?: string; version?: string; logline?: string | null; synopsis?: string | null; output?: any };
type GeneratedPackage = { nextAction?: string; generation?: any; script?: any; scriptVersion?: any; aiRun?: any; aiOutput?: any };

const departments = [
  ['development', 'Development'], ['preproduction', 'Pre-Production'], ['production', 'Production'],
  ['post', 'Post'], ['localization', 'Localization'], ['delivery', 'QC + Delivery'],
  ['rights', 'Rights'], ['buyers', 'Buyers'], ['billing', 'Billing'], ['analytics', 'Analytics'], ['admin', 'Admin'],
] as const;
const gates = ['Script', 'Character / World Bible', 'Visual Assets', 'Shot', 'Edit', 'Audio', 'Localization', 'Rights', 'QC', 'Final Master'];
const memberTabs: Record<string,string> = { development:'overview', preproduction:'scenes', production:'shots', post:'edits' };

async function authHeaders() {
  if (!supabase) return {};
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function FilmOS() {
  const { id } = useParams<{ id: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [projectsError, setProjectsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [oneLine, setOneLine] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('overview');
  const [rows, setRows] = useState<Row[]>([]);
  const [generated, setGenerated] = useState<GeneratedPackage | null>(null);

  const projectId = id || project?.id;
  useEffect(() => { const load = async () => { if (!supabase) { setProjectsError('Supabase is not configured.'); setLoading(false); return; } const { data, error } = await supabase.from('film_projects').select('id,name,logline,synopsis,stage,approval_state,organization_id').order('created_at', { ascending: false }).limit(50); if (error) { setProjectsError(error.message); setLoading(false); return; } const list = (data || []) as Project[]; setProjects(list); setProject(id ? list.find((p) => p.id === id) || null : list[0] || null); setLoading(false); }; void load(); }, [id]);
  useEffect(() => { const loadRows = async () => { if (!supabase || !projectId) return; const table = tab === 'scripts' ? 'scripts' : tab === 'scenes' ? 'scenes' : tab === 'shots' ? 'shots' : tab === 'assets' ? 'assets' : 'approvals'; const { data, error } = await supabase.from(table).select('*').eq('project_id', projectId).limit(50); if (!error) setRows((data || []) as Row[]); }; void loadRows(); }, [projectId, tab]);

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice(''); if (!newName.trim()) return;
    const headers = await authHeaders();
    setBusy(true);
    try {
      const response = await fetch('/api/film-os/create-project', { method:'POST', headers:{...headers,'Content-Type':'application/json'}, body: JSON.stringify({ name:newName.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Project creation failed');
      const created = payload.project as Project;
      setProjects((p) => [created, ...p]); setProject(created); setNewName(''); setNotice('Project created. Owner access is active.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Project creation failed'); }
    finally { setBusy(false); }
  };

  const generateFilm = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice(''); setGenerated(null); if (!projectId || !oneLine.trim()) return;
    const headers = await authHeaders();
    setBusy(true);
    try {
      const response = await fetch('/api/film-os/generate', { method:'POST', headers:{...headers,'Content-Type':'application/json'}, body: JSON.stringify({ projectId, concept: oneLine.trim() }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Film generation failed');
      setGenerated(payload as GeneratedPackage);
      setProject((p) => p ? ({ ...p, logline: payload.script?.logline || oneLine.trim(), synopsis: payload.script?.synopsis || p.synopsis, approval_state:'review', stage:'development' }) : p);
      setOneLine('');
      setTab('scripts');
      setNotice(payload.nextAction || 'Development package generated and placed into review.');
      if (supabase) {
        const { data } = await supabase.from('film_projects').select('id,name,logline,synopsis,stage,approval_state,organization_id').eq('id', projectId).maybeSingle();
        if (data) setProject(data as Project);
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Film generation failed'); }
    finally { setBusy(false); }
  };

  const updateApproval = async (entityType: string, entityId: string, status: string) => { if (!supabase || !projectId) return; const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { error } = await supabase.from('approvals').insert({ project_id: projectId, entity_type: entityType, entity_id: entityId, status, reviewer_id: user.id }); if (error) setNotice(error.message); else setNotice(`${entityType} marked ${status}.`); };
  const stageIndex = useMemo(() => departments.findIndex(([key]) => key === (project?.stage || 'development')), [project]);
  if (loading) return <div className="min-h-screen bg-[#050607] text-zinc-400 grid place-items-center">Loading Film OS…</div>;

  return <div className="min-h-screen bg-[#050607] text-zinc-100"><header className="sticky top-0 z-30 border-b border-white/10 bg-[#050607]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4"><div><Link to="/" className="text-xs font-semibold tracking-[0.32em] text-white/60">STREAMVISTA</Link><div className="mt-1 text-lg font-semibold">Film OS</div></div><div className="flex items-center gap-3 text-xs text-white/45"><span>{project?.name || 'No project selected'}</span><Link className="rounded-full border border-white/10 px-3 py-2 hover:bg-white/5" to="/">Home</Link></div></div></header>
    <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 lg:grid-cols-[250px_1fr]"><aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="text-xs font-semibold tracking-[0.2em] text-white/30">PROJECTS</div><form onSubmit={createProject} className="mt-4 space-y-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New film / project" className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25" /><button disabled={busy} className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black">{busy ? 'Creating…' : 'Create project'}</button></form><div className="mt-5 space-y-1">{projects.map((p) => <button key={p.id} onClick={() => setProject(p)} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${project?.id === p.id ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5'}`}>{p.name}</button>)}{projects.length === 0 && !projectsError && <div className="px-3 py-3 text-xs text-white/30">No Film OS projects yet.</div>}</div></aside>
      <main className="space-y-5">{projectsError && <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{projectsError}</div>}{notice && <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/65">{notice}</div>}
        {!project ? <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8"><h1 className="text-3xl font-semibold">Build the next film.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/40">Create a project to connect script, scenes, shots, assets, AI runs, approvals, edit, localization, QC and delivery in one production graph.</p></section> : <><section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><div className="text-xs tracking-[0.2em] text-white/30">ACTIVE PROJECT</div><h1 className="mt-2 text-3xl font-semibold">{project.name}</h1><p className="mt-2 text-sm leading-6 text-white/40">{project.logline || 'One line becomes the development package, then moves forward through the production graph.'}</p></div><div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right"><div className="text-xs text-white/30">STATE</div><div className="mt-1 text-sm font-semibold">{project.approval_state.replace('_', ' ').toUpperCase()}</div></div></div>
          <form onSubmit={generateFilm} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]"><input value={oneLine} onChange={(e) => setOneLine(e.target.value)} placeholder="Give the Film OS one line. It will develop the next step." className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-white/25" /><button disabled={busy || !oneLine.trim()} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? 'Working…' : 'Make the film'}</button></form>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-11">{departments.map(([key,label],index) => <button key={key} onClick={() => setTab(memberTabs[key] || key)} className={`rounded-lg border px-2 py-2 text-[10px] ${index <= stageIndex ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 bg-white/[0.02] text-white/30'}`}>{label}</button>)}</div></section>
        <section className="grid gap-4 md:grid-cols-3">{[['Create','Idea → Script → Scenes → Shots'],['Produce','Assets → Edit → Audio → Localization'],['Release','Rights → QC → Master → Delivery → Revenue']].map(([title,text]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-sm font-semibold">{title}</div><div className="mt-2 text-sm leading-6 text-white/38">{text}</div></div>)}</section>
        {generated?.generation && <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between gap-4"><div><div className="text-xs tracking-[0.18em] text-white/30">AI DEVELOPMENT PACKAGE</div><div className="mt-2 text-xl font-semibold">Ready for human review</div></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55">REVIEW</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><div className="text-xs text-white/30">LOGLINE</div><p className="mt-2 text-sm leading-6 text-white/70">{generated.generation.logline || generated.script?.logline}</p></div><div><div className="text-xs text-white/30">SYNOPSIS</div><p className="mt-2 text-sm leading-6 text-white/55">{generated.generation.synopsis || generated.script?.synopsis}</p></div></div><div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">Next action: {generated.nextAction || 'Review the development package.'}</div></section>}
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"><div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">{['overview','scripts','scenes','shots','assets','edits','audio','localization','rights','qc','delivery','billing','analytics','admin'].map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-3 py-2 text-xs ${tab === item ? 'bg-white text-black' : 'bg-white/5 text-white/55'}`}>{item}</button>)}</div>
          {tab === 'overview' ? <div className="grid gap-4 pt-5 md:grid-cols-2"><div><div className="text-xs tracking-[0.18em] text-white/30">CANONICAL PROJECT GRAPH</div><div className="mt-3 text-sm leading-7 text-white/65">Project → Script Version → Scene → Shot → Asset → AI Run → Approved Asset → Edit Version → Master → Deliverable</div></div><div><div className="text-xs tracking-[0.18em] text-white/30">APPROVAL GATES</div><div className="mt-3 flex flex-wrap gap-2">{gates.map((gate) => <span key={gate} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50">{gate}</span>)}</div></div></div> : tab === 'edits' || tab === 'audio' || tab === 'localization' || tab === 'rights' || tab === 'qc' || tab === 'delivery' || tab === 'billing' || tab === 'analytics' || tab === 'admin' ? <div className="pt-5"><div className="text-lg font-semibold capitalize">{tab}</div><p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">This department is part of the canonical Film OS surface. Real records are required; no mock production data is generated.</p></div> : <div className="pt-5 space-y-3">{rows.length === 0 && <div className="rounded-xl border border-white/10 p-5 text-sm text-white/35">No real records visible under current RLS.</div>}{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 p-4"><div><div className="font-medium">{row.name || row.title || row.id}</div><div className="mt-1 text-xs text-white/30">{row.approval_state || row.status || row.version || 'record'}</div></div><div className="flex gap-2"><button onClick={() => updateApproval(tab, row.id, 'review')} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Review</button><button onClick={() => updateApproval(tab, row.id, 'approved')} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black">Approve</button></div></div>)}</div>}
        </section></>}
      </main></div></div>;
}
