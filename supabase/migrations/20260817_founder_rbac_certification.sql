-- Founder RBAC certification evidence store.
-- The protected API writes through the Supabase service role after independently
-- deriving the authenticated user's role from sv_app_profiles.

create table if not exists public.sv_rbac_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target text not null,
  resolved_role text,
  outcome text not null check (outcome in ('allowed', 'denied', 'unauthenticated')),
  client_role_attempted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sv_rbac_audit_log_actor_created_idx
  on public.sv_rbac_audit_log (actor_id, created_at desc);

create index if not exists sv_rbac_audit_log_action_created_idx
  on public.sv_rbac_audit_log (action, created_at desc);

alter table public.sv_rbac_audit_log enable row level security;

revoke all on table public.sv_rbac_audit_log from anon, authenticated;
grant all on table public.sv_rbac_audit_log to service_role;

comment on table public.sv_rbac_audit_log is
  'Server-generated RBAC evidence. Client roles are never authoritative.';
