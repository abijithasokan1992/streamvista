-- PREPARED ONLY. Do not apply while production is frozen.
-- Enables buyer discovery, screening requests, licensing deals, and a private film bucket.

insert into storage.buckets (id,name,public) values ('streamvista-films','streamvista-films',false) on conflict (id) do nothing;

create table if not exists public.sv_screening_requests (
  id uuid primary key default gen_random_uuid(), buyer_id uuid not null references public.sv_app_profiles(id), title_id uuid not null references public.sv_app_titles(id), status text not null default 'requested' check(status in ('requested','approved','declined','watched')), created_at timestamptz not null default now(), unique(buyer_id,title_id)
);
create table if not exists public.sv_marketplace_deals (
  id uuid primary key default gen_random_uuid(), buyer_id uuid not null references public.sv_app_profiles(id), title_id uuid not null references public.sv_app_titles(id), status text not null default 'requested', contract_status text not null default 'pending', payment_status text not null default 'unpaid', price numeric not null default 0, revenue_split numeric not null default 70 check(revenue_split between 0 and 100), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.sv_screening_requests enable row level security;
alter table public.sv_marketplace_deals enable row level security;

create policy sv_titles_buyer_discovery on public.sv_app_titles for select to authenticated using (
  status='approved' and exists(select 1 from public.sv_app_profiles p where p.id=auth.uid() and p.app_role='buyer')
);
create policy sv_screening_buyer_insert on public.sv_screening_requests for insert to authenticated with check (buyer_id=auth.uid());
create policy sv_screening_read on public.sv_screening_requests for select to authenticated using (buyer_id=auth.uid() or (select private.sv_app_is_admin()));
create policy sv_deals_buyer_insert on public.sv_marketplace_deals for insert to authenticated with check (buyer_id=auth.uid());
create policy sv_deals_read on public.sv_marketplace_deals for select to authenticated using (buyer_id=auth.uid() or (select private.sv_app_is_admin()));
create policy sv_deals_admin_update on public.sv_marketplace_deals for update to authenticated using ((select private.sv_app_is_admin())) with check ((select private.sv_app_is_admin()));

create policy sv_films_owner_insert on storage.objects for insert to authenticated with check (bucket_id='streamvista-films' and (storage.foldername(name))[1]=auth.uid()::text);
create policy sv_films_owner_read on storage.objects for select to authenticated using (bucket_id='streamvista-films' and ((storage.foldername(name))[1]=auth.uid()::text or (select private.sv_app_is_admin())));
