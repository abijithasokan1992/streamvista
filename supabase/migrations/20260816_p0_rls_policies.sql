-- P0 RLS for StreamVista Final MVP
-- Project: uakpqqardziifcwzvgfx only — do not apply to unrelated DBs.
-- Prerequisite: 20260816_p0_schema_deps.sql (verification_status on profiles)
-- Live titles ownership column: creator_id (not creator_owner_id)
-- Live approved status may be ready_for_distribution (app maps to approved)
-- Core boundary: Browser → Auth → RLS → Storage.
-- Idempotent where possible. Review before Run in SQL Editor.

create schema if not exists private;

create or replace function private.sv_app_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1
    from public.sv_app_profiles p
    where p.id = auth.uid()
      and p.app_role in ('admin', 'founder', 'super_admin', 'platform_owner')
  );
$$;

revoke all on function private.sv_app_is_admin() from public, anon;
grant execute on function private.sv_app_is_admin() to authenticated, service_role;

create or replace function private.sv_buyer_verified()
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1
    from public.sv_app_profiles p
    where p.id = auth.uid()
      and p.app_role = 'buyer'
      and coalesce(p.verification_status, 'pending') in ('verified', 'approved')
  );
$$;

revoke all on function private.sv_buyer_verified() from public, anon;
grant execute on function private.sv_buyer_verified() to authenticated, service_role;

-- Approved title status values used by app + legacy
create or replace function private.sv_title_is_approved(p_status text)
returns boolean
language sql
immutable
as $$
  select p_status in ('approved', 'ready_for_distribution');
$$;

revoke all on function private.sv_title_is_approved(text) from public, anon;
grant execute on function private.sv_title_is_approved(text) to authenticated, service_role;

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'sv_session_profile'
  ) then
    execute 'revoke all on function public.sv_session_profile() from public, anon';
    execute 'grant execute on function public.sv_session_profile() to authenticated, service_role';
  end if;
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'sv_current_role'
  ) then
    execute 'revoke all on function public.sv_current_role() from public, anon';
    execute 'grant execute on function public.sv_current_role() to authenticated, service_role';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
alter table if exists public.sv_app_profiles enable row level security;

drop policy if exists sv_profiles_select_own on public.sv_app_profiles;
create policy sv_profiles_select_own
  on public.sv_app_profiles for select to authenticated
  using (id = auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_profiles_update_own_safe on public.sv_app_profiles;
create policy sv_profiles_update_own_safe
  on public.sv_app_profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and app_role = (select p.app_role from public.sv_app_profiles p where p.id = auth.uid())
    and coalesce(verification_status, '') = coalesce(
      (select p.verification_status from public.sv_app_profiles p where p.id = auth.uid()),
      ''
    )
  );

drop policy if exists sv_profiles_admin_all on public.sv_app_profiles;
create policy sv_profiles_admin_all
  on public.sv_app_profiles for all to authenticated
  using (private.sv_app_is_admin())
  with check (private.sv_app_is_admin());

-- ---------------------------------------------------------------------------
-- Titles (ownership column = creator_id on live canonical schema)
-- ---------------------------------------------------------------------------
alter table if exists public.sv_app_titles enable row level security;

drop policy if exists sv_titles_creator_select on public.sv_app_titles;
create policy sv_titles_creator_select
  on public.sv_app_titles for select to authenticated
  using (
    creator_id = auth.uid()
    or private.sv_app_is_admin()
    or (
      private.sv_title_is_approved(status)
      and private.sv_buyer_verified()
    )
  );

drop policy if exists sv_titles_buyer_discovery on public.sv_app_titles;

drop policy if exists sv_titles_creator_insert on public.sv_app_titles;
create policy sv_titles_creator_insert
  on public.sv_app_titles for insert to authenticated
  with check (
    creator_id = auth.uid()
    and exists (
      select 1 from public.sv_app_profiles p
      where p.id = auth.uid()
        and p.app_role in (
          'creator', 'creator_partner', 'studio',
          'admin', 'founder', 'super_admin', 'platform_owner'
        )
    )
  );

drop policy if exists sv_titles_creator_update on public.sv_app_titles;
create policy sv_titles_creator_update
  on public.sv_app_titles for update to authenticated
  using (creator_id = auth.uid() or private.sv_app_is_admin())
  with check (creator_id = auth.uid() or private.sv_app_is_admin());

-- ---------------------------------------------------------------------------
-- Screening + deals
-- ---------------------------------------------------------------------------
alter table if exists public.sv_screening_requests enable row level security;
alter table if exists public.sv_marketplace_deals enable row level security;

drop policy if exists sv_screening_buyer_insert on public.sv_screening_requests;
create policy sv_screening_buyer_insert
  on public.sv_screening_requests for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and private.sv_buyer_verified()
  );

drop policy if exists sv_screening_read on public.sv_screening_requests;
create policy sv_screening_read
  on public.sv_screening_requests for select to authenticated
  using (buyer_id = auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_screening_admin_update on public.sv_screening_requests;
create policy sv_screening_admin_update
  on public.sv_screening_requests for update to authenticated
  using (private.sv_app_is_admin())
  with check (private.sv_app_is_admin());

drop policy if exists sv_deals_buyer_insert on public.sv_marketplace_deals;
create policy sv_deals_buyer_insert
  on public.sv_marketplace_deals for insert to authenticated
  with check (buyer_id = auth.uid() and private.sv_buyer_verified());

drop policy if exists sv_deals_read on public.sv_marketplace_deals;
create policy sv_deals_read
  on public.sv_marketplace_deals for select to authenticated
  using (buyer_id = auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_deals_admin_update on public.sv_marketplace_deals;
create policy sv_deals_admin_update
  on public.sv_marketplace_deals for update to authenticated
  using (private.sv_app_is_admin())
  with check (private.sv_app_is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('streamvista-films', 'streamvista-films', false)
on conflict (id) do update set public = false;

drop policy if exists sv_films_creator_insert on storage.objects;
create policy sv_films_creator_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'streamvista-films'
    and exists (
      select 1 from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
    )
  );

drop policy if exists sv_films_creator_update on storage.objects;
create policy sv_films_creator_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'streamvista-films'
    and exists (
      select 1 from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
    )
  );

drop policy if exists sv_films_secure_read on storage.objects;
create policy sv_films_secure_read
  on storage.objects for select to authenticated
  using (
    bucket_id = 'streamvista-films'
    and (
      exists (
        select 1 from public.sv_app_titles t
        where t.id::text = (storage.foldername(name))[1]
          and t.creator_id = auth.uid()
      )
      or exists (
        select 1 from public.sv_screening_requests s
        where s.buyer_id = auth.uid()
          and s.status = 'approved'
          and s.title_id::text = (storage.foldername(name))[1]
      )
      or private.sv_app_is_admin()
    )
  );

drop policy if exists sv_films_creator_delete on storage.objects;
create policy sv_films_creator_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'streamvista-films'
    and (
      exists (
        select 1 from public.sv_app_titles t
        where t.id::text = (storage.foldername(name))[1]
          and t.creator_id = auth.uid()
      )
      or private.sv_app_is_admin()
    )
  );

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'finance_public_status'
  ) then
    execute 'revoke all on function public.finance_public_status() from public, anon';
  end if;
exception when others then
  null;
end $$;
