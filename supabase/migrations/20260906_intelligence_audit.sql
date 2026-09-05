-- StreamVista Intelligence execution audit.
-- Stores reproducibility metadata without provider secrets.

create table if not exists public.intelligence_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.sv_app_titles(id) on delete set null,
  operator_id uuid references auth.users(id) on delete set null,
  input_snapshot jsonb not null default '{}'::jsonb,
  data_classification jsonb not null default '{}'::jsonb,
  provider text,
  model text,
  provider_request_id text,
  structured_output jsonb not null default '{}'::jsonb,
  assumptions jsonb not null default '{}'::jsonb,
  data_quality jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.intelligence_runs enable row level security;

create policy intelligence_runs_owner_read
  on public.intelligence_runs
  for select
  to authenticated
  using (operator_id = auth.uid() or public.is_command_admin());

revoke all on public.intelligence_runs from anon;
grant select on public.intelligence_runs to authenticated;
grant all on public.intelligence_runs to service_role;

create index if not exists idx_intelligence_runs_project on public.intelligence_runs(project_id, created_at desc);
create index if not exists idx_intelligence_runs_operator on public.intelligence_runs(operator_id, created_at desc);
