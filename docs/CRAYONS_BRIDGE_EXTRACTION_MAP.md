# Crayons Bridge — Extraction Map

## KEEP / REUSE

| Classification | Existing source | Bridge role |
|---|---|---|
| KEEP | `apps/web/app/pages/Login.tsx` | Supabase email/password login UI |
| KEEP | `apps/web/app/lib/supabase.ts` | Auth + Supabase client dependency; production project ref must be independently verified |
| REUSE | `apps/web/app/pages/CreatorStudio.tsx` | Creator title management + private content upload |
| REUSE | `apps/web/app/pages/CrayonsBridge.tsx` | Bridge page shell |
| REUSE | `apps/web/app/pages/marketplace/Marketplace.tsx` | Approved catalog discovery/search; refactored to non-payment licensing request |
| REUSE | `apps/web/app/components/AssetCard.tsx` | Catalog card UI |
| REUSE / INSPECT | `apps/web/app/pages/Watch.tsx` | Secure buyer screening room; confirm entitlement dependencies before final isolation |
| KEEP / DATA DEPENDENCY | `sv_app_profiles` | identity + role + verification |
| KEEP / DATA DEPENDENCY | `sv_app_titles` | content/title metadata |
| KEEP / DATA DEPENDENCY | `sv_title_rights` | rights + ownership records |
| KEEP / DATA DEPENDENCY | `sv_screening_requests` | buyer screening/access requests |
| KEEP / DATA DEPENDENCY | `sv_marketplace_deals` | B2B deal state |
| DEPENDENCY | `streamvista-films` storage bucket | private title asset storage |
| DEPENDENCY | RLS/functions in `20260830_production_baseline.sql` | role, buyer verification, owner isolation, secure storage |

## REMOVE / EXCLUDE FROM THE NEW APP

- `apps/web/app/components/LicenseCheckout.tsx`
- Razorpay SDK and browser checkout
- payment order/verification/webhook endpoints
- `sv_payments` and payment UI as Bridge business features
- UPI
- Pricing/commerce/revenue routes
- Crayons LOOP routes
- FAST/distribution-specific routes
- unrelated AI routes
- Kerala Police routes
- unrelated StreamVista Cloud/Film OS surfaces

## Important implementation finding
`Marketplace.tsx` previously depended on `LicenseCheckout.tsx`, which hard-wired Razorpay. On this branch the Marketplace action was changed to a non-payment licensing request UI that records a buyer screening request and explicitly does not initiate payment.

## Remaining isolation work
The existing `App.tsx` still exposes the broader StreamVista route map because this branch began as a full `main` snapshot. The Bridge production shell must be reduced to Bridge-only routes before deployment, while retaining only verified internal dependencies.
