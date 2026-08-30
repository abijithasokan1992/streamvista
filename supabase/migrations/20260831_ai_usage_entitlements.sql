-- Revenue-safe AI allowance ledger for Crayons Pictures.
-- No provider usage or cost is fabricated; each successful generation gets one ledger row.

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  kind text not null,
  job_id uuid references public.ai_jobs(id) on delete set null,
  tool text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_ai_usage_job on public.ai_usage(job_id) where job_id is not null;
create index if not exists idx_ai_usage_user_date on public.ai_usage(user_id, usage_date, kind);

alter table public.ai_usage enable row level security;
drop policy if exists ai_usage_read_own on public.ai_usage;
create policy ai_usage_read_own on public.ai_usage for select to authenticated using (user_id = auth.uid() or public.sv_current_role() in ('founder','super_admin','admin'));
drop policy if exists ai_usage_deny_client_write on public.ai_usage;
create policy ai_usage_deny_client_write on public.ai_usage for all to authenticated using (false) with check (false);

drop policy if exists ai_jobs_read_own on public.ai_jobs;
create policy ai_jobs_read_own on public.ai_jobs for select to authenticated using (created_by = auth.uid() or public.sv_current_role() in ('founder','super_admin','admin'));
drop policy if exists ai_jobs_insert_own on public.ai_jobs;
create policy ai_jobs_insert_own on public.ai_jobs for insert to authenticated with check (created_by = auth.uid());
drop policy if exists ai_jobs_update_own on public.ai_jobs;
create policy ai_jobs_update_own on public.ai_jobs for update to authenticated using (created_by = auth.uid() or public.sv_current_role() in ('founder','super_admin','admin')) with check (created_by = auth.uid() or public.sv_current_role() in ('founder','super_admin','admin'));
