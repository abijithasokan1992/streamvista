-- Public StreamVista signup hardening.
-- Public signup may request only creator or buyer.
-- Privileged staff roles remain server/admin controlled and are never accepted from user metadata.

alter table app.profiles
  alter column role drop default;

create or replace function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = app, auth, public, pg_catalog
as $$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  requested_role text := lower(nullif(trim(new.raw_user_meta_data ->> 'signup_role'), ''));
  requested_org text := nullif(trim(new.raw_user_meta_data ->> 'organization_name'), '');
  assigned_role app.app_role;
  assigned_verification text;
  assigned_onboarding text;
begin
  -- Metadata changes after account creation may update non-privileged profile details,
  -- but must never mutate the server-controlled role or verification state.
  if tg_op = 'UPDATE' then
    update app.profiles
       set email = normalized_email,
           full_name = coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), full_name),
           organization_name = case
             when role = 'buyer'::app.app_role then coalesce(requested_org, organization_name)
             else organization_name
           end,
           updated_at = now()
     where id = new.id;
    return new;
  end if;

  -- Preserve the existing founder bootstrap. This path is server-defined and cannot
  -- be selected from the public signup form or raw user metadata.
  if normalized_email = 'abijithasokan@crayonspictures.com' then
    assigned_role := 'admin'::app.app_role;
    assigned_verification := 'verified';
    assigned_onboarding := 'active';
  else
    if requested_role not in ('creator', 'buyer') then
      raise exception using
        errcode = '22023',
        message = 'A valid public signup role is required.',
        detail = 'Allowed public roles are creator and buyer.';
    end if;

    assigned_role := requested_role::app.app_role;

    if assigned_role = 'buyer'::app.app_role then
      assigned_verification := 'pending';
      assigned_onboarding := 'verification_pending';
    else
      assigned_verification := 'verified';
      assigned_onboarding := 'active';
    end if;
  end if;

  insert into app.profiles(
    id,
    email,
    full_name,
    role,
    verification_status,
    onboarding_status,
    organization_name
  )
  values(
    new.id,
    normalized_email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    assigned_role,
    assigned_verification,
    assigned_onboarding,
    case when assigned_role = 'buyer'::app.app_role then requested_org else null end
  )
  on conflict(id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, app.profiles.full_name),
        organization_name = case
          when app.profiles.role = 'buyer'::app.app_role
            then coalesce(excluded.organization_name, app.profiles.organization_name)
          else app.profiles.organization_name
        end,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.sv_session_profile()
returns jsonb
language sql
stable
security definer
set search_path = public, app, auth, pg_catalog
as $$
  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'display_name', coalesce(nullif(p.full_name, ''), split_part(p.email, '@', 1)),
    'app_role', public.sv_current_role(),
    'verification_status', p.verification_status,
    'organization_name', p.organization_name,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  )
  from app.profiles p
  where p.id = auth.uid()
  limit 1
$$;

revoke all on function public.sv_session_profile() from public, anon;
grant execute on function public.sv_session_profile() to authenticated, service_role;
