-- StreamVista Film OS canonical production graph.
-- Composes on the existing sv_* identity/commerce foundation.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','producer','director','writer','production','art_design','camera_vfx','editor','sound','localization','qc','rights_legal','sales','admin')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.film_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  logline text,
  synopsis text,
  stage text not null default 'development',
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','producer','director','writer','production','art_design','camera_vfx','editor','sound','localization','qc','rights_legal','sales','admin')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (project_id, name)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  status text not null default 'todo',
  assigned_to uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  kind text not null default 'project',
  content jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  title text not null,
  current_version_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.script_versions (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.scripts(id) on delete cascade,
  version_number integer not null,
  content text not null default '',
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (script_id, version_number)
);

alter table public.scripts drop constraint if exists scripts_current_version_fk;
alter table public.scripts add constraint scripts_current_version_fk foreign key (current_version_id) references public.script_versions(id) on delete set null;

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  script_version_id uuid references public.script_versions(id) on delete set null,
  scene_number integer,
  heading text,
  synopsis text,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  shot_number integer,
  shot_type text,
  description text,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  name text not null,
  profile jsonb not null default '{}'::jsonb,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete set null,
  shot_id uuid references public.shots(id) on delete set null,
  asset_type text not null,
  storage_path text,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  version_number integer not null,
  storage_path text,
  checksum text,
  metadata jsonb not null default '{}'::jsonb,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now(),
  unique (asset_id, version_number)
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  department text,
  agent text,
  provider text,
  model text,
  instruction text,
  input_assets uuid[] not null default '{}',
  cost numeric not null default 0,
  usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  ai_run_id uuid not null references public.ai_runs(id) on delete cascade,
  output_asset_id uuid references public.assets(id) on delete set null,
  version text not null default '1',
  output jsonb not null default '{}'::jsonb,
  approval_state text not null default 'ai_generated' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'review' check (status in ('review','approved','rejected','locked')),
  reviewer_id uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.film_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.edits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  name text not null,
  version text not null default '1',
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.timelines (
  id uuid primary key default gen_random_uuid(),
  edit_id uuid not null references public.edits(id) on delete cascade,
  duration_seconds numeric,
  composition jsonb not null default '{}'::jsonb,
  version text not null default '1',
  created_at timestamptz not null default now()
);

create table if not exists public.audio_tracks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  track_type text not null,
  asset_id uuid references public.assets(id) on delete set null,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.subtitles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  language text not null,
  format text not null check (format in ('srt','vtt')),
  storage_path text,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.dubs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  language text not null,
  voice_provider text,
  asset_id uuid references public.assets(id) on delete set null,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.audio_descriptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  language text not null,
  asset_id uuid references public.assets(id) on delete set null,
  approval_state text not null default 'draft' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.qc_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  master_id uuid,
  qc_type text not null,
  status text not null default 'pending',
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.qc_issues (
  id uuid primary key default gen_random_uuid(),
  qc_run_id uuid not null references public.qc_runs(id) on delete cascade,
  severity text not null,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rights_claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  claimant_id uuid references auth.users(id) on delete set null,
  claim_type text not null,
  territory text,
  status text not null default 'pending',
  approval_state text not null default 'review' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.rights_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  claim_id uuid references public.rights_claims(id) on delete set null,
  storage_path text,
  checksum text,
  created_at timestamptz not null default now()
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  buyer_id uuid references public.sv_app_profiles(id) on delete set null,
  territory text,
  platform text,
  license_model text,
  starts_on date,
  ends_on date,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.masters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  edit_id uuid references public.edits(id) on delete set null,
  version text not null,
  storage_path text,
  checksum text,
  approval_state text not null default 'review' check (approval_state in ('draft','ai_generated','review','approved','locked','delivered')),
  created_at timestamptz not null default now()
);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  master_id uuid references public.masters(id) on delete set null,
  type text not null,
  format text,
  status text not null default 'pending',
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_manifests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.film_projects(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete set null,
  destination text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.film_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  usage_type text not null,
  units numeric not null default 0,
  amount numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null,
  status text not null default 'active',
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.film_projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_film_projects_org on public.film_projects(organization_id);
create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_tasks_project on public.tasks(project_id);
create index if not exists idx_scripts_project on public.scripts(project_id);
create index if not exists idx_scenes_project on public.scenes(project_id);
create index if not exists idx_shots_scene on public.shots(scene_id);
create index if not exists idx_assets_project on public.assets(project_id);
create index if not exists idx_asset_versions_asset on public.asset_versions(asset_id);
create index if not exists idx_ai_runs_project on public.ai_runs(project_id);
create index if not exists idx_approvals_project on public.approvals(project_id);
create index if not exists idx_edits_project on public.edits(project_id);
create index if not exists idx_masters_project on public.masters(project_id);
create index if not exists idx_deliverables_project on public.deliverables(project_id);

-- Baseline RLS. Access is project-member based; admin roles are still handled by the existing sv_* security layer.

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.film_projects enable row level security;
alter table public.project_members enable row level security;
alter table public.departments enable row level security;
alter table public.tasks enable row level security;
alter table public.briefs enable row level security;
alter table public.scripts enable row level security;
alter table public.script_versions enable row level security;
alter table public.scenes enable row level security;
alter table public.shots enable row level security;
alter table public.characters enable row level security;
alter table public.assets enable row level security;
alter table public.asset_versions enable row level security;
alter table public.ai_runs enable row level security;
alter table public.ai_outputs enable row level security;
alter table public.approvals enable row level security;
alter table public.comments enable row level security;
alter table public.activity_log enable row level security;
alter table public.edits enable row level security;
alter table public.timelines enable row level security;
alter table public.audio_tracks enable row level security;
alter table public.subtitles enable row level security;
alter table public.dubs enable row level security;
alter table public.audio_descriptions enable row level security;
alter table public.qc_runs enable row level security;
alter table public.qc_issues enable row level security;
alter table public.rights_claims enable row level security;
alter table public.rights_documents enable row level security;
alter table public.licenses enable row level security;
alter table public.masters enable row level security;
alter table public.deliverables enable row level security;
alter table public.delivery_manifests enable row level security;
alter table public.usage enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.film_os_project_member(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_catalog as $$
  select exists (select 1 from public.project_members pm where pm.project_id = p_project_id and pm.user_id = auth.uid());
$$;
revoke all on function public.film_os_project_member(uuid) from public, anon;
grant execute on function public.film_os_project_member(uuid) to authenticated, service_role;

create or replace function public.film_os_org_member(p_org_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_catalog as $$
  select exists (select 1 from public.memberships m where m.organization_id = p_org_id and m.user_id = auth.uid());
$$;
revoke all on function public.film_os_org_member(uuid) from public, anon;
grant execute on function public.film_os_org_member(uuid) to authenticated, service_role;

create policy film_org_member on public.organizations for select to authenticated using (public.film_os_org_member(id) or owner_id = auth.uid());
create policy film_membership_self on public.memberships for select to authenticated using (user_id = auth.uid() or public.film_os_org_member(organization_id));
create policy film_project_member_read on public.film_projects for select to authenticated using (public.film_os_project_member(id) or created_by = auth.uid());
create policy film_project_creator_insert on public.film_projects for insert to authenticated with check (created_by = auth.uid());
create policy film_project_member_update on public.film_projects for update to authenticated using (public.film_os_project_member(id) or created_by = auth.uid()) with check (public.film_os_project_member(id) or created_by = auth.uid());
create policy film_project_member_manage on public.project_members for all to authenticated using (public.film_os_project_member(project_id) or exists (select 1 from public.film_projects p where p.id = project_members.project_id and p.created_by = auth.uid())) with check (public.film_os_project_member(project_id) or exists (select 1 from public.film_projects p where p.id = project_members.project_id and p.created_by = auth.uid()));

create policy film_department_project on public.departments for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_tasks_project on public.tasks for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_briefs_project on public.briefs for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_scripts_project on public.scripts for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_script_versions_project on public.script_versions for all to authenticated using (exists (select 1 from public.scripts s where s.id = script_id and public.film_os_project_member(s.project_id))) with check (exists (select 1 from public.scripts s where s.id = script_id and public.film_os_project_member(s.project_id)));
create policy film_scenes_project on public.scenes for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_shots_project on public.shots for all to authenticated using (exists (select 1 from public.scenes s where s.id = scene_id and public.film_os_project_member(s.project_id))) with check (exists (select 1 from public.scenes s where s.id = scene_id and public.film_os_project_member(s.project_id)));
create policy film_characters_project on public.characters for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_assets_project on public.assets for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_asset_versions_project on public.asset_versions for all to authenticated using (exists (select 1 from public.assets a where a.id = asset_id and public.film_os_project_member(a.project_id))) with check (exists (select 1 from public.assets a where a.id = asset_id and public.film_os_project_member(a.project_id)));
create policy film_ai_runs_project on public.ai_runs for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_ai_outputs_project on public.ai_outputs for all to authenticated using (exists (select 1 from public.ai_runs r where r.id = ai_run_id and public.film_os_project_member(r.project_id))) with check (exists (select 1 from public.ai_runs r where r.id = ai_run_id and public.film_os_project_member(r.project_id)));
create policy film_approvals_project on public.approvals for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_comments_project on public.comments for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id) and user_id = auth.uid());
create policy film_activity_project on public.activity_log for select to authenticated using (project_id is null or public.film_os_project_member(project_id));
create policy film_activity_insert on public.activity_log for insert to authenticated with check (user_id = auth.uid() and (project_id is null or public.film_os_project_member(project_id)));
create policy film_edits_project on public.edits for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_timelines_project on public.timelines for all to authenticated using (exists (select 1 from public.edits e where e.id = edit_id and public.film_os_project_member(e.project_id))) with check (exists (select 1 from public.edits e where e.id = edit_id and public.film_os_project_member(e.project_id)));
create policy film_audio_project on public.audio_tracks for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_subtitles_project on public.subtitles for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_dubs_project on public.dubs for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_ad_project on public.audio_descriptions for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_qc_project on public.qc_runs for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_qc_issue_project on public.qc_issues for all to authenticated using (exists (select 1 from public.qc_runs q where q.id = qc_run_id and public.film_os_project_member(q.project_id))) with check (exists (select 1 from public.qc_runs q where q.id = qc_run_id and public.film_os_project_member(q.project_id)));
create policy film_rights_project on public.rights_claims for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_rights_docs_project on public.rights_documents for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_license_project on public.licenses for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_masters_project on public.masters for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_deliverables_project on public.deliverables for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_manifests_project on public.delivery_manifests for all to authenticated using (public.film_os_project_member(project_id)) with check (public.film_os_project_member(project_id));
create policy film_usage_project on public.usage for all to authenticated using (user_id = auth.uid() or public.film_os_project_member(project_id)) with check (user_id = auth.uid() or public.film_os_project_member(project_id));
create policy film_subscriptions_self on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy film_audit_project on public.audit_logs for select to authenticated using (user_id = auth.uid() or public.film_os_project_member(project_id));
create policy film_audit_insert on public.audit_logs for insert to authenticated with check (user_id = auth.uid() and (project_id is null or public.film_os_project_member(project_id)));
