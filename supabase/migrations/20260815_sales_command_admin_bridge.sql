-- StreamVista Sales Agent admin bridge
-- PREPARED ONLY. Do not apply to production without Founder approval and E2E verification.
--
-- Existing sales tables are already protected by policies that call is_command_admin().
-- The legacy implementation checks only public.user_roles, while the canonical app role
-- resolver is public.sv_current_role(), which already reads server-controlled role state.
-- Reuse the canonical resolver instead of duplicating identity logic.

create or replace function public.is_command_admin()
returns boolean
language sql
stable
security definer
set search_path = public, app, auth, pg_catalog
as $$
  select public.sv_current_role() in ('founder', 'super_admin', 'admin');
$$;

revoke all on function public.is_command_admin() from public;
grant execute on function public.is_command_admin() to authenticated;

comment on function public.is_command_admin() is
  'Returns true only for authenticated StreamVista founder/super_admin/admin roles resolved through the canonical sv_current_role() function. Used by protected sales command policies.';
