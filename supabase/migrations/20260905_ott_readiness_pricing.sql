-- StreamVista OTT Readiness commercial pricing.
-- Prices are stored in paise and consumed server-side by the Razorpay order function.
-- Keep existing creator/topup checkout semantics unchanged elsewhere.

insert into public.sales_pipeline_rules (rule_key, rule_value, description)
values (
  'streamvista_ott_readiness_prices',
  '{"audit":750000,"launch":2500000,"currency":"INR"}'::jsonb,
  'Canonical server-side Razorpay OTT Readiness prices in paise'
)
on conflict (rule_key) do update
set rule_value = excluded.rule_value,
    description = excluded.description,
    updated_at = now();
