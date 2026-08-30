create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id uuid references public.sv_app_titles(id) on delete set null,
  deal_id uuid references public.sv_marketplace_deals(id) on delete set null,
  payment_id uuid references public.sv_payments(id) on delete set null,
  entitlement_type text not null default 'title-license',
  status text not null default 'active' check (status in ('active','revoked','expired')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, payment_id, entitlement_type)
);

alter table public.entitlements enable row level security;
drop policy if exists entitlements_read_own on public.entitlements;
create policy entitlements_read_own on public.entitlements for select to authenticated using (user_id = auth.uid() or public.sv_current_role() in ('founder','super_admin','admin'));
drop policy if exists entitlements_deny_client_write on public.entitlements;
create policy entitlements_deny_client_write on public.entitlements for all to authenticated using (false) with check (false);

alter table public.sv_payments alter column verified_at drop default;
