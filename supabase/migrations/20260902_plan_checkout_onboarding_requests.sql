-- StreamVista plan checkout ledger used by Razorpay plan orders.

create table if not exists public.onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  submitter_user_id uuid references auth.users(id) on delete set null,
  selected_cycle text not null check (selected_cycle in ('creator','topup')),
  payment_status text not null default 'pending' check (payment_status in ('pending','created','authorized','captured','failed','refunded')),
  onboarding_status text not null default 'pending_payment' check (onboarding_status in ('pending_payment','active','failed','cancelled')),
  amount_paise integer not null default 0 check (amount_paise >= 0),
  currency text not null default 'INR' check (currency = upper(currency) and length(currency) = 3),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_requests enable row level security;

grant select on public.onboarding_requests to authenticated;
grant select, insert, update on public.onboarding_requests to service_role;

drop policy if exists onboarding_requests_own_read on public.onboarding_requests;
create policy onboarding_requests_own_read
  on public.onboarding_requests
  for select
  to authenticated
  using (submitter_user_id = auth.uid() or private.sv_app_is_admin());

drop policy if exists onboarding_requests_deny_client_write on public.onboarding_requests;
create policy onboarding_requests_deny_client_write
  on public.onboarding_requests
  for all
  to authenticated
  using (false)
  with check (false);

create index if not exists idx_onboarding_requests_submitter on public.onboarding_requests(submitter_user_id);
create index if not exists idx_onboarding_requests_razorpay_order on public.onboarding_requests(razorpay_order_id);
