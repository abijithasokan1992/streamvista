# Rule 77 — Commercial E2E Release

Current production floor remains `main` at the verified production deployment. This branch contains only forward, minimal changes required to connect existing systems.

## Release sequence

Auth → Creator ownership → Storage → Marketplace → Razorpay → Webhook → Payment persistence → Revenue visibility → E2E

## Rules

- Preserve all working production functionality.
- No duplicate architecture.
- No fake/demo production data.
- No secrets committed to source.
- Existing Supabase commercial tables remain the persistence target.
- Existing Razorpay integration remains the payment provider.
- Failed/refunded/test historical payments are excluded from new revenue KPIs; records are not deleted.
- Meta/OpenRouter are optional integrations and do not replace Supabase Auth or Razorpay.

## Release evidence required

- Authenticated user identity and session.
- Creator ownership under existing RLS.
- Private storage ownership/upload.
- Existing commercial action reaches the payment flow.
- Razorpay server-side verification and webhook signature validation.
- Idempotent webhook persistence.
- Durable payment state in existing canonical payment tables.
- Revenue visibility derived from successful/captured payments only.
- Production E2E proof before promotion.
