import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Users, Film, FileCheck2, Handshake, Activity, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  creator: 'Creator', creator_partner: 'Creator', studio: 'Studio', buyer: 'Buyer', admin: 'Admin', super_admin: 'Admin', founder: 'Admin', viewer: 'Viewer', operations: 'System', qc: 'System', legal: 'System', support: 'System', finance: 'System'
};

function Card({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.16em] text-white/35">{label}</span><Icon size={17} className="text-cyan-300" /></div><div className="mt-3 text-2xl font-semibold">{value}</div></div>;
}

export default function BridgeDashboard() {
  const [role, setRole] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [stats, setStats] = useState({ titles: 0, rights: 0, screenings: 0, deals: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) return setError('Supabase is not configured for this deployment.');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Session expired. Please sign in again.');
      const { data: profile } = await supabase.from('sv_app_profiles').select('app_role, verification_status').eq('id', user.id).maybeSingle();
      setRole(profile?.app_role || '');
      setProfileStatus(profile?.verification_status || 'pending');
      const [titles, rights, screenings, deals] = await Promise.all([
        supabase.from('sv_app_titles').select('id', { count: 'exact', head: true }),
        supabase.from('sv_title_rights').select('id', { count: 'exact', head: true }),
        supabase.from('sv_screening_requests').select('id', { count: 'exact', head: true }),
        supabase.from('sv_marketplace_deals').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ titles: titles.count || 0, rights: rights.count || 0, screenings: screenings.count || 0, deals: deals.count || 0 });
    };
    void load();
  }, []);

  const kind = ROLE_LABELS[role] || 'Authenticated';
  const actions = useMemo(() => {
    if (kind === 'Buyer') return [['Discover approved content', '/crayons-bridge'], ['Open secure screening', '/watch']];
    if (kind === 'Admin' || kind === 'System') return [['Review catalog', '/crayons-bridge'], ['System monitoring', '/admin/noc']];
    return [['Manage your content', '/creator-studio'], ['Browse Bridge catalog', '/crayons-bridge']];
  }, [kind]);

  return <main className="min-h-screen bg-[#05070a] text-white"><div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
    <div className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">CRAYONS BRIDGE · ROLE WORKSPACE</div><h1 className="mt-2 text-4xl font-semibold tracking-tight">{kind} Dashboard</h1><p className="mt-2 text-sm text-white/40">Rights, catalog, screening and B2B licensing workflow.</p></div><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60"><ShieldCheck size={15} className="text-cyan-300" /> {role || 'authenticated'} · {profileStatus}</div></div>
    {error && <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{error}</div>}
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card label="Titles" value={String(stats.titles)} icon={Film} /><Card label="Rights records" value={String(stats.rights)} icon={FileCheck2} /><Card label="Screening requests" value={String(stats.screenings)} icon={Users} /><Card label="Deals" value={String(stats.deals)} icon={Handshake} /></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="flex items-center gap-2"><Activity size={17} className="text-cyan-300" /><h2 className="text-lg font-semibold">Bridge workflow</h2></div><div className="mt-6 grid gap-3 md:grid-cols-2">{['Content submission', 'Rights verification', 'Admin approval', 'Buyer discovery', 'Screening request', 'Licensing discussion', 'Deal Room', 'Agreement / handoff'].map((step, i) => <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[10px] text-white/25">STEP {String(i + 1).padStart(2, '0')}</div><div className="mt-1 text-sm font-semibold">{step}</div></div>)}</div></div><div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><div className="flex items-center gap-2"><Lock size={17} className="text-cyan-300" /><h2 className="text-lg font-semibold">Quick actions</h2></div><div className="mt-5 space-y-3">{actions.map(([label, href]) => <a key={href} href={href} className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold hover:bg-white/[0.07]">{label}<span className="float-right text-white/30">→</span></a>)}</div><p className="mt-6 text-xs leading-5 text-white/30">Bridge contains no checkout or payment action. Commercial terms proceed through controlled licensing and Deal Room workflow.</p></div></section>
  </div></main>;
}
