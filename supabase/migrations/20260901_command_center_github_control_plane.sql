create table if not exists public.command_center_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'github'),
  status text not null check (status in ('running','success','failed')),
  started_at timestamptz not null,
  completed_at timestamptz,
  repositories_discovered integer not null default 0 check (repositories_discovered >= 0),
  error_code text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists command_center_sync_runs_provider_started_idx
  on public.command_center_sync_runs(provider, started_at desc);

create table if not exists public.command_center_repositories (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'github'),
  external_id text not null,
  full_name text not null,
  name text not null,
  owner text not null,
  default_branch text,
  visibility text,
  archived boolean not null default false,
  html_url text,
  clone_url text,
  github_updated_at timestamptz,
  snapshot_at timestamptz not null,
  raw_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, external_id)
);

create index if not exists command_center_repositories_provider_updated_idx
  on public.command_center_repositories(provider, github_updated_at desc);

create table if not exists public.command_center_repository_snapshots (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid not null references public.command_center_sync_runs(id) on delete cascade,
  repository_id uuid not null references public.command_center_repositories(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists command_center_repository_snapshots_run_idx
  on public.command_center_repository_snapshots(sync_run_id, created_at desc);

create table if not exists public.command_center_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_type text not null,
  actor_id uuid,
  provider text,
  entity_type text,
  entity_id text,
  status text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists command_center_audit_events_created_idx
  on public.command_center_audit_events(created_at desc);

alter table public.command_center_sync_runs enable row level security;
alter table public.command_center_repositories enable row level security;
alter table public.command_center_repository_snapshots enable row level security;
alter table public.command_center_audit_events enable row level security;

revoke all on table public.command_center_sync_runs from anon, authenticated;
revoke all on table public.command_center_repositories from anon, authenticated;
revoke all on table public.command_center_repository_snapshots from anon, authenticated;
revoke all on table public.command_center_audit_events from anon, authenticated;

grant select, insert, update, delete on table public.command_center_sync_runs to service_role;
grant select, insert, update, delete on table public.command_center_repositories to service_role;
grant select, insert, update, delete on table public.command_center_repository_snapshots to service_role;
grant select, insert, update, delete on table public.command_center_audit_events to service_role;
