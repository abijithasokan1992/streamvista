# StreamVista — P0 Buyer Portal Production Reconciliation

Date: 2026-09-06

## Scope

Harden the existing StreamVista production boundary without rebuilding the application, duplicating databases, deleting canonical data, or manufacturing buyer/content inventory.

## Verified source mapping

- Canonical repository: `abijithasokan1992/streamvista`
- Canonical branch: `main`
- Canonical Vercel `streamvista` project is GitHub-linked to this repository.
- The Vercel `antigravity-live` project is separately GitHub-linked to `abijithasokan1992/Antigravity-Live` and is not the canonical StreamVista repository.
- The previously cited `frontend-next/src/app/buyer-portal/page.tsx` path is not present in the canonical StreamVista `main` source tree. Do not fabricate a replacement route in this repository until the deployed source mapping is established.

## Backend truth

Supabase project `uakpqqardziifcwzvgfx` is ACTIVE_HEALTHY and contains the existing StreamVista schema needed for production reconciliation, including:

- `sv_app_titles`
- `sv_title_rights`
- `sv_marketplace_deals`
- `sv_deal_offers`
- `sv_payments`
- `sv_payment_webhook_events`
- `sv_audit_events`

Existing canonical migrations include the P0 schema/RLS/security hardening and Razorpay/payment contract migrations. Reuse them; do not create parallel replacement tables.

## Payment truth

The canonical API already contains a real Razorpay order service and server-side signature verification. Production code must continue to fail closed when credentials are missing and must persist payment state in `sv_payments`.

## Changes on P0 branch

1. Removed the hard-coded Supabase URL from `apps/auto-api/src/server.ts`; the API now resolves `SUPABASE_URL` only from the deployment environment while still failing closed when missing.
2. Hardened `apps/auto-api/src/routes/razorpayWebhook.ts` to:
   - require a valid webhook signature,
   - persist webhook receipt state,
   - recognize processed duplicate events idempotently,
   - persist captured/authorized/failed payment state,
   - propagate captured/refunded payment state to the linked marketplace deal,
   - fail closed on database errors.
3. Added this reconciliation record so future merges do not confuse `antigravity-live` Buyer Portal source with canonical StreamVista source.

## Release blockers still open

- The canonical StreamVista repository does not contain the audited Buyer Portal React source path. A real source/deployment mapping must be established before implementing/removing Buyer Portal UI data.
- Real buyer identities and approved buyer records are not yet proven in the canonical `sv_*` marketplace tables.
- Real rights rows for marketplace titles are not yet proven in `sv_title_rights`.
- Authenticated browser E2E for Buyer Login → Content → Rights → Deal → Contract → Payment → Audit is not yet proven.
- Razorpay connector is read-only in this session; no new live payment transaction can be executed here. Existing merchant history proves the account is active, not that the Buyer Portal path has completed a new live E2E.
- Contract/signing integration is not proven in the canonical repository.
- Hostinger Mail is a deployment dependency, but no buyer-contract notification is certified by this reconciliation.

## Preservation rule

**Reuse first. Reconcile second. Repair third. Verify last.**

Do not mark the Buyer Portal `PRODUCTION VERIFIED` until the full evidence chain exists.
