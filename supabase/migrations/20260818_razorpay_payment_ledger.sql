-- Razorpay production ledger + webhook idempotency for canonical StreamVista.
-- Canonical project: tqzimuwozhipqgyerdff.
-- Apply only through the normal Supabase migration pipeline.

alter table public.sv_payments
  add column if not exists idempotency_key text,
  add column if not exists error_reason text;

create unique index if not exists sv_payments_user_deal_idempotency_uidx
  on public.sv_payments(user_id, deal_id, purpose, idempotency_key)
  where idempotency_key is not null;

create unique index if not exists sv_payments_provider_event_uidx
  on public.sv_payments(provider_event_id)
  where provider_event_id is not null;

create index if not exists sv_payments_provider_order_idx
  on public.sv_payments(provider, provider_order_id)
  where provider_order_id is not null;

create index if not exists sv_payments_provider_payment_idx
  on public.sv_payments(provider, provider_payment_id)
  where provider_payment_id is not null;

create table if not exists public.sv_payment_webhook_events (
  event_id text primary key,
  event_name text not null,
  payload_hash text not null,
  status text not null default 'received' check (status in ('received','processed','failed')),
  payment_id uuid references public.sv_payments(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists sv_payment_webhook_events_status_idx
  on public.sv_payment_webhook_events(status, received_at desc);

alter table public.sv_payment_webhook_events enable row level security;
revoke all on public.sv_payment_webhook_events from anon, authenticated;
grant select on public.sv_payment_webhook_events to authenticated;

drop policy if exists sv_payment_webhook_events_admin_read on public.sv_payment_webhook_events;
create policy sv_payment_webhook_events_admin_read
  on public.sv_payment_webhook_events
  for select to authenticated
  using (public.is_command_admin());
