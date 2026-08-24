-- Production hardening for the canonical StreamVista film bucket and Razorpay ledger.
-- Secrets remain server-side; this migration contains no credentials.

insert into storage.buckets (id, name, public)
values ('streamvista-films', 'streamvista-films', false)
on conflict (id) do update set public = false;

-- Browser writes are permitted only to authenticated users who own the title
-- represented by the first path segment. This is the profile/ownership boundary.
drop policy if exists sv_films_creator_insert on storage.objects;
create policy sv_films_creator_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'streamvista-films'
    and exists (
      select 1
      from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
        and exists (
          select 1
          from public.sv_app_profiles p
          where p.id = auth.uid()
            and p.app_role in ('creator', 'creator_partner', 'studio', 'admin', 'founder', 'super_admin', 'platform_owner')
        )
    )
  );

drop policy if exists sv_films_creator_update on storage.objects;
create policy sv_films_creator_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'streamvista-films'
    and exists (
      select 1
      from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'streamvista-films'
    and exists (
      select 1
      from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
    )
  );

drop policy if exists sv_films_creator_delete on storage.objects;
create policy sv_films_creator_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'streamvista-films'
    and exists (
      select 1
      from public.sv_app_titles t
      where t.id::text = (storage.foldername(name))[1]
        and t.creator_id = auth.uid()
    )
  );

-- No anonymous storage modification policy is created. Reads remain private and
-- are governed by the existing title/screening/admin policies.

create table if not exists public.razorpay_webhook_ledger (
  event_id text primary key,
  event_name text not null,
  payload_hash text not null,
  provider_payment_id text,
  provider_order_id text,
  deal_id uuid references public.sv_marketplace_deals(id) on delete set null,
  amount numeric,
  currency text,
  status text not null default 'received' check (status in ('received','processed','failed')),
  raw_payload jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists razorpay_webhook_ledger_deal_idx
  on public.razorpay_webhook_ledger(deal_id, received_at desc);
create index if not exists razorpay_webhook_ledger_payment_idx
  on public.razorpay_webhook_ledger(provider_payment_id)
  where provider_payment_id is not null;

alter table public.razorpay_webhook_ledger enable row level security;
revoke all on public.razorpay_webhook_ledger from anon, authenticated;
grant select on public.razorpay_webhook_ledger to authenticated;

drop policy if exists razorpay_webhook_ledger_admin_read on public.razorpay_webhook_ledger;
create policy razorpay_webhook_ledger_admin_read
  on public.razorpay_webhook_ledger for select to authenticated
  using (private.sv_app_is_admin());

-- Refresh PostgREST's schema cache after the new ledger relation is applied.
notify pgrst, 'reload schema';
