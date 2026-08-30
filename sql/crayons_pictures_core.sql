-- Crayons Pictures core state. Additive migration: does not delete or rewrite legacy StreamVista tables.
create schema if not exists cps;

create table if not exists cps.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cps.workspace_members (
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists cps.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  name text not null,
  description text,
  project_type text not null default 'film',
  status text not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cps.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  project_id uuid references cps.projects(id) on delete set null,
  owner_user_id uuid not null references auth.users(id),
  kind text not null,
  storage_provider text not null,
  storage_key text not null,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  status text not null default 'ready',
  parent_asset_id uuid references cps.assets(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cps.ai_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  project_id uuid references cps.projects(id) on delete set null,
  requested_by uuid not null references auth.users(id),
  capability text not null,
  provider text,
  model text,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error_code text,
  error_message text,
  input_tokens bigint,
  output_tokens bigint,
  estimated_cost_minor bigint,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists cps.render_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  project_id uuid references cps.projects(id) on delete set null,
  requested_by uuid not null references auth.users(id),
  capability text not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  priority integer not null default 100,
  attempt_count integer not null default 0,
  worker_id text,
  heartbeat_at timestamptz,
  input jsonb not null default '{}'::jsonb,
  output_asset_id uuid references cps.assets(id) on delete set null,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists cps.render_job_attempts (
  id uuid primary key default gen_random_uuid(),
  render_job_id uuid not null references cps.render_jobs(id) on delete cascade,
  attempt_no integer not null,
  worker_id text,
  status text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  unique (render_job_id, attempt_no)
);

create table if not exists cps.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references cps.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  feature text not null,
  quantity numeric not null,
  unit text not null,
  provider text,
  provider_request_id text,
  source_type text not null,
  source_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists cps.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_name text not null,
  payload_hash text not null,
  status text not null default 'received',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table if not exists cps.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references cps.workspaces(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cps_workspace_members_user_idx on cps.workspace_members(user_id);
create index if not exists cps_projects_workspace_idx on cps.projects(workspace_id, created_at desc);
create index if not exists cps_assets_workspace_idx on cps.assets(workspace_id, created_at desc);
create index if not exists cps_ai_runs_workspace_idx on cps.ai_runs(workspace_id, created_at desc);
create index if not exists cps_render_jobs_queue_idx on cps.render_jobs(status, priority, created_at);
create index if not exists cps_render_jobs_workspace_idx on cps.render_jobs(workspace_id, created_at desc);
create index if not exists cps_usage_workspace_idx on cps.usage_ledger(workspace_id, created_at desc);
create index if not exists cps_audit_workspace_idx on cps.audit_events(workspace_id, created_at desc);

alter table cps.workspaces enable row level security;
alter table cps.workspace_members enable row level security;
alter table cps.projects enable row level security;
alter table cps.assets enable row level security;
alter table cps.ai_runs enable row level security;
alter table cps.render_jobs enable row level security;
alter table cps.render_job_attempts enable row level security;
alter table cps.usage_ledger enable row level security;
alter table cps.webhook_events enable row level security;
alter table cps.audit_events enable row level security;

create or replace function cps.is_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = cps, pg_catalog
as $$
  select exists (
    select 1 from cps.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
  );
$$;

revoke all on function cps.is_member(uuid) from public;
grant execute on function cps.is_member(uuid) to authenticated;

create policy cps_workspace_select on cps.workspaces
for select to authenticated using (cps.is_member(id) or owner_user_id = (select auth.uid()));
create policy cps_workspace_insert on cps.workspaces
for insert to authenticated with check (owner_user_id = (select auth.uid()));
create policy cps_workspace_update on cps.workspaces
for update to authenticated using (owner_user_id = (select auth.uid()));

create policy cps_member_select on cps.workspace_members
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_member_insert on cps.workspace_members
for insert to authenticated with check (cps.is_member(workspace_id));
create policy cps_member_update on cps.workspace_members
for update to authenticated using (cps.is_member(workspace_id));
create policy cps_member_delete on cps.workspace_members
for delete to authenticated using (cps.is_member(workspace_id));

create policy cps_project_select on cps.projects
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_project_insert on cps.projects
for insert to authenticated with check (cps.is_member(workspace_id) and created_by = (select auth.uid()));
create policy cps_project_update on cps.projects
for update to authenticated using (cps.is_member(workspace_id));
create policy cps_project_delete on cps.projects
for delete to authenticated using (cps.is_member(workspace_id));

create policy cps_asset_select on cps.assets
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_asset_insert on cps.assets
for insert to authenticated with check (cps.is_member(workspace_id) and owner_user_id = (select auth.uid()));
create policy cps_asset_update on cps.assets
for update to authenticated using (cps.is_member(workspace_id));
create policy cps_asset_delete on cps.assets
for delete to authenticated using (cps.is_member(workspace_id));

create policy cps_ai_run_select on cps.ai_runs
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_render_job_select on cps.render_jobs
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_render_job_insert on cps.render_jobs
for insert to authenticated with check (cps.is_member(workspace_id) and requested_by = (select auth.uid()));
create policy cps_usage_select on cps.usage_ledger
for select to authenticated using (cps.is_member(workspace_id));
create policy cps_audit_select on cps.audit_events
for select to authenticated using (cps.is_member(workspace_id) and actor_user_id = (select auth.uid()));

-- AI execution, payment reconciliation, webhooks and worker mutations must use a server-side role.
revoke all on all tables in schema cps from anon;
revoke all on cps.webhook_events from authenticated;
revoke all on cps.render_job_attempts from authenticated;

comment on schema cps is 'Crayons Pictures production backend state. Additive boundary; legacy StreamVista data remains isolated.';
