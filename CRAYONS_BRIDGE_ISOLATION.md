# CRAYONS BRIDGE — ISOLATION CONTRACT

This branch (`crayons-bridge-main`) is the dedicated development source for the separate Crayons Bridge B2B Content Licensing application.

## Source and safety
- Source: `main` at branch creation.
- `main` remains untouched.
- Do not delete or modify unrelated StreamVista functionality in `main`.
- Prefer reuse/composition over rebuilding.

## Bridge-required surfaces
- Supabase Auth/login/session persistence
- Role-based access control
- Creator workspace
- Studio workspace
- Buyer workspace
- Admin workspace
- Viewer/screener workspace
- System/operations workspace
- Content/title metadata
- Content upload/private storage
- Rights and ownership records
- Screening requests
- Catalog/marketplace discovery
- Licensing workflow
- Deal workflow / Deal Room
- Audit/security controls
- Required API and Supabase data access

## Existing implementation candidates identified in `main`
- `apps/web/app/pages/Login.tsx` — reuse candidate for Auth UI.
- `apps/web/app/lib/supabase.ts` — dependency for Supabase Auth/data access; verify project binding before production.
- `apps/web/app/pages/CreatorStudio.tsx` — reuse candidate for title creation, title management and private asset upload.
- `apps/web/app/pages/CrayonsBridge.tsx` — Bridge shell; currently mounts Marketplace.
- `apps/web/app/pages/marketplace/Marketplace.tsx` — reuse candidate for DB-backed approved-title discovery and search, but its licensing action currently imports payment checkout and must be refactored for non-payment licensing workflow.
- `apps/web/app/components/AssetCard.tsx` — reusable catalog card.
- `apps/web/app/pages/Watch.tsx` — reusable secure screening-room candidate; inspect entitlement/request dependencies before inclusion.
- `supabase/migrations/20260830_production_baseline.sql` — establishes core `sv_app_profiles`, `sv_app_titles`, `sv_title_rights`, `sv_screening_requests`, `sv_marketplace_deals` and RLS/storage policies. It also contains payment tables/policies which must not be exposed/used by Bridge.
- `docs/CRAYONS_PICTURES_GITHUB_MODULE_MAP.md` — canonical module ownership map.
- `CRAYONS_BRIDGE_ROADMAP.md` — Bridge architecture/roadmap source.

## Explicit exclusions for Bridge
Do not expose or import payment/commerce code, including:
- Razorpay checkout and SDK usage
- UPI
- payment order/verification/webhook UI or handlers
- payment billing/revenue screens
- `LicenseCheckout.tsx`
- payment tables as part of Bridge business workflow

Also exclude unrelated StreamVista, Crayons LOOP, FAST, AI, Kerala Police and other non-Bridge product surfaces unless a verified internal dependency is proven.

## Current technical finding
The existing Marketplace is not Bridge-ready as-is because `Marketplace.tsx` imports `LicenseCheckout.tsx`, and `LicenseCheckout.tsx` hard-wires Razorpay and payment APIs. The isolated app must replace this action with a non-payment licensing/deal request flow.

## Branch rule
This document is the contract for extraction work on `crayons-bridge-main`. The branch is separate from `main`; production deployment should point to this branch only after the Bridge-specific app shell, dependencies, RBAC, data paths, non-payment licensing workflow and tests are verified.
