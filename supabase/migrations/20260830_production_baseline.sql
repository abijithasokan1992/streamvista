-- StreamVista production baseline
-- Canonical production project: tqzimuwozhipqgyerdff
-- Establishes the minimum real data plane used by the current app.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.sv_app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  app_role text not null default 'creator_partner' check (app_role in ('founder','super_admin','admin','buyer','creator','creator_partner','studio','finance','qc','legal','operations','support')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','approved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sv_app_titles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.sv_app_profiles(id) on delete cascade,
  title text not null default 'Untitled',
  synopsis text,
  content_type text,
  primary_language text,
  director text,
  status text not null default 'draft' check (status in ('draft','qc','approved','ready_for_distribution','archived')),
  commercial_profile jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sv_title_rights (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.sv_app_titles(id) on delete cascade,
  owner_id uuid not null references public.sv_app_profiles(id) on delete cascade,
  licensed_buyer_id uuid references public.sv_app_profiles(id) on delete set null,
  territory text,
  platform text,
  exclusivity text,
  licensing_model text not null default 'non-exclusive',
  rights_start_date date,
  rights_end_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.sv_screening_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.sv_app_profiles(id) on delete cascade,
  title_id uuid not null references public.sv_app_titles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','approved','declined','watched')),
  created_at timestamptz not null default now(),
  unique (buyer_id,title_id)
);

create table if not exists public.sv_marketplace_deals (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.sv_app_profiles(id) on delete cascade,
  seller_id uuid references public.sv_app_profiles(id) on delete set null,
  title_id uuid not null references public.sv_app_titles(id) on delete cascade,
  status text not null default 'requested',
  contract_status text not null default 'pending',
  payment_status text not null default 'unpaid',
  price numeric not null default 0,
  revenue_split numeric not null default 70 check (revenue_split between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sv_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.sv_app_profiles(id) on delete set null,
  title_id uuid references public.sv_app_titles(id) on delete set null,
  deal_id uuid references public.sv_marketplace_deals(id) on delete set null,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  provider_event_id text,
  amount numeric not null default 0,
  currency text not null default 'INR',
  purpose text not null default 'streamvista',
  status text not null default 'created' check (status in ('created','authorized','captured','verified','failed','refunded')),
  error_reason text,
  idempotency_key text unique,
  raw_event_hash text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sv_payment_webhook_events (
  event_id text primary key,
  provider_event_id text,
  event_name text not null,
  payload_hash text not null,
  status text not null default 'received' check (status in ('received','processed','failed')),
  payment_id text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create or replace function public.handle_streamvista_auth_user()
returns trigger language plpgsql security definer set search_path = public, pg_catalog as $$
begin
  insert into public.sv_app_profiles (id,email,display_name)
  values (new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'display_name',''))
  on conflict (id) do update set email=excluded.email,
    display_name=case when excluded.display_name<>'' then excluded.display_name else public.sv_app_profiles.display_name end,
    updated_at=now();
  return new;
end; $$;

revoke all on function public.handle_streamvista_auth_user() from public, anon;
grant execute on function public.handle_streamvista_auth_user() to supabase_auth_admin, service_role;
drop trigger if exists on_auth_user_created_streamvista on auth.users;
create trigger on_auth_user_created_streamvista after insert on auth.users for each row execute function public.handle_streamvista_auth_user();

create or replace function public.sv_current_role()
returns text language sql stable security definer set search_path = public, pg_catalog as $$
  select coalesce((select app_role from public.sv_app_profiles where id=auth.uid()),'creator_partner');
$$;
create or replace function public.sv_session_profile()
returns jsonb language sql stable security definer set search_path = public, pg_catalog as $$
  select coalesce((select to_jsonb(p) from public.sv_app_profiles p where p.id=auth.uid()),'{}'::jsonb);
$$;
create or replace function public.sv_admin_profiles()
returns setof public.sv_app_profiles language sql stable security definer set search_path = public, pg_catalog as $$
  select p from public.sv_app_profiles p where public.sv_current_role() in ('founder','super_admin','admin');
$$;
create or replace function private.sv_app_is_admin()
returns boolean language sql stable security definer set search_path = public, private, pg_temp as $$
  select public.sv_current_role() in ('founder','super_admin','admin');
$$;
create or replace function private.sv_buyer_verified()
returns boolean language sql stable security definer set search_path = public, private, pg_temp as $$
  select exists(select 1 from public.sv_app_profiles p where p.id=auth.uid() and p.app_role='buyer' and p.verification_status in ('verified','approved'));
$$;
create or replace function private.sv_title_is_approved(p_status text)
returns boolean language sql immutable as $$ select p_status in ('approved','ready_for_distribution'); $$;
create or replace function public.is_command_admin()
returns boolean language sql stable security definer set search_path = public, pg_catalog as $$
  select public.sv_current_role() in ('founder','super_admin','admin');
$$;

revoke all on function public.sv_current_role() from public, anon; grant execute on function public.sv_current_role() to authenticated, service_role;
revoke all on function public.sv_session_profile() from public, anon; grant execute on function public.sv_session_profile() to authenticated, service_role;
revoke all on function public.sv_admin_profiles() from public, anon; grant execute on function public.sv_admin_profiles() to authenticated, service_role;
revoke all on function private.sv_app_is_admin() from public, anon; grant execute on function private.sv_app_is_admin() to authenticated, service_role;
revoke all on function private.sv_buyer_verified() from public, anon; grant execute on function private.sv_buyer_verified() to authenticated, service_role;
revoke all on function private.sv_title_is_approved(text) from public, anon; grant execute on function private.sv_title_is_approved(text) to authenticated, service_role;
revoke all on function public.is_command_admin() from public, anon; grant execute on function public.is_command_admin() to authenticated, service_role;

alter table public.sv_app_profiles enable row level security;
alter table public.sv_app_titles enable row level security;
alter table public.sv_title_rights enable row level security;
alter table public.sv_screening_requests enable row level security;
alter table public.sv_marketplace_deals enable row level security;
alter table public.sv_payments enable row level security;
alter table public.sv_payment_webhook_events enable row level security;

drop policy if exists sv_profiles_select_own on public.sv_app_profiles;
create policy sv_profiles_select_own on public.sv_app_profiles for select to authenticated using (id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_profiles_update_own_safe on public.sv_app_profiles;
create policy sv_profiles_update_own_safe on public.sv_app_profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and app_role=public.sv_current_role());
drop policy if exists sv_profiles_admin_all on public.sv_app_profiles;
create policy sv_profiles_admin_all on public.sv_app_profiles for all to authenticated using (private.sv_app_is_admin()) with check (private.sv_app_is_admin());

drop policy if exists sv_titles_creator_select on public.sv_app_titles;
create policy sv_titles_creator_select on public.sv_app_titles for select to authenticated using (creator_id=auth.uid() or private.sv_app_is_admin() or (private.sv_title_is_approved(status) and private.sv_buyer_verified()));
drop policy if exists sv_titles_creator_insert on public.sv_app_titles;
create policy sv_titles_creator_insert on public.sv_app_titles for insert to authenticated with check (creator_id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_titles_creator_update on public.sv_app_titles;
create policy sv_titles_creator_update on public.sv_app_titles for update to authenticated using (creator_id=auth.uid() or private.sv_app_is_admin()) with check (creator_id=auth.uid() or private.sv_app_is_admin());

drop policy if exists sv_rights_owner_read on public.sv_title_rights;
create policy sv_rights_owner_read on public.sv_title_rights for select to authenticated using (owner_id=auth.uid() or licensed_buyer_id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_screening_buyer_insert on public.sv_screening_requests;
create policy sv_screening_buyer_insert on public.sv_screening_requests for insert to authenticated with check (buyer_id=auth.uid() and private.sv_buyer_verified());
drop policy if exists sv_screening_read on public.sv_screening_requests;
create policy sv_screening_read on public.sv_screening_requests for select to authenticated using (buyer_id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_screening_admin_update on public.sv_screening_requests;
create policy sv_screening_admin_update on public.sv_screening_requests for update to authenticated using (private.sv_app_is_admin()) with check (private.sv_app_is_admin());

drop policy if exists sv_deals_buyer_insert on public.sv_marketplace_deals;
create policy sv_deals_buyer_insert on public.sv_marketplace_deals for insert to authenticated with check (buyer_id=auth.uid() and private.sv_buyer_verified());
drop policy if exists sv_deals_read on public.sv_marketplace_deals;
create policy sv_deals_read on public.sv_marketplace_deals for select to authenticated using (buyer_id=auth.uid() or seller_id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_deals_admin_update on public.sv_marketplace_deals;
create policy sv_deals_admin_update on public.sv_marketplace_deals for update to authenticated using (private.sv_app_is_admin()) with check (private.sv_app_is_admin());

drop policy if exists sv_payments_own_read on public.sv_payments;
create policy sv_payments_own_read on public.sv_payments for select to authenticated using (user_id=auth.uid() or private.sv_app_is_admin());
drop policy if exists sv_payments_deny_client_write on public.sv_payments;
create policy sv_payments_deny_client_write on public.sv_payments for all to authenticated using (false) with check (false);
drop policy if exists sv_webhook_deny_client on public.sv_payment_webhook_events;
create policy sv_webhook_deny_client on public.sv_payment_webhook_events for all to authenticated using (false) with check (false);

insert into storage.buckets (id,name,public) values ('streamvista-films','streamvista-films',false) on conflict (id) do update set public=false;
drop policy if exists sv_films_creator_insert on storage.objects;
create policy sv_films_creator_insert on storage.objects for insert to authenticated with check (bucket_id='streamvista-films' and exists(select 1 from public.sv_app_titles t where t.id::text=(storage.foldername(name))[1] and (t.creator_id=auth.uid() or private.sv_app_is_admin())));
drop policy if exists sv_films_secure_read on storage.objects;
create policy sv_films_secure_read on storage.objects for select to authenticated using (bucket_id='streamvista-films' and (exists(select 1 from public.sv_app_titles t where t.id::text=(storage.foldername(name))[1] and t.creator_id=auth.uid()) or exists(select 1 from public.sv_screening_requests s where s.buyer_id=auth.uid() and s.status='approved' and s.title_id::text=(storage.foldername(name))[1]) or private.sv_app_is_admin()));
drop policy if exists sv_films_creator_update on storage.objects;
create policy sv_films_creator_update on storage.objects for update to authenticated using (bucket_id='streamvista-films' and exists(select 1 from public.sv_app_titles t where t.id::text=(storage.foldername(name))[1] and (t.creator_id=auth.uid() or private.sv_app_is_admin())));
drop policy if exists sv_films_creator_delete on storage.objects;
create policy sv_films_creator_delete on storage.objects for delete to authenticated using (bucket_id='streamvista-films' and exists(select 1 from public.sv_app_titles t where t.id::text=(storage.foldername(name))[1] and (t.creator_id=auth.uid() or private.sv_app_is_admin())));

create index if not exists idx_sv_titles_creator on public.sv_app_titles(creator_id);
create index if not exists idx_sv_titles_status on public.sv_app_titles(status);
create index if not exists idx_sv_screening_buyer on public.sv_screening_requests(buyer_id);
create index if not exists idx_sv_deals_buyer on public.sv_marketplace_deals(buyer_id);
create index if not exists idx_sv_payments_order on public.sv_payments(provider_order_id);
create index if not exists idx_sv_payments_user on public.sv_payments(user_id);
