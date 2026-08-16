-- P0 schema dependencies for #54 RLS
-- Canonical project only: uakpqqardziifcwzvgfx
-- Additive / safe. Run BEFORE 20260816_p0_rls_policies.sql
--
-- Live findings:
--   sv_app_profiles lacked verification_status (required for buyer fail-closed)
--   sv_app_titles uses creator_id (app maps this to creator_owner_id in TS)

-- Buyer verification gate column
alter table public.sv_app_profiles
  add column if not exists verification_status text;

-- Default existing rows: buyers stay pending until admin verifies; others verified for ops continuity
update public.sv_app_profiles
set verification_status = case
  when app_role = 'buyer' then coalesce(verification_status, 'pending')
  else coalesce(verification_status, 'verified')
end
where verification_status is null;

alter table public.sv_app_profiles
  alter column verification_status set default 'pending';

comment on column public.sv_app_profiles.verification_status is
  'Buyer onboarding: pending until admin/founder approves. Not client-writable under RLS.';
