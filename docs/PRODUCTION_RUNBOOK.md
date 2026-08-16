# StreamVista Production Runbook

## Canonical production architecture

The active StreamVista web release path is:

**GitHub `abijithasokan1992/streamvista` → Vercel → Supabase `uakpqqardziifcwzvgfx`**

Current production truth must be established from repository + deployment + runtime evidence together. Legacy Firebase/mock/SQLite code in the repository is not production truth unless explicitly promoted and verified.

## Required Vercel configuration

The StreamVista frontend and `/api/ready` release gate require:

```env
VITE_SUPABASE_URL=https://uakpqqardziifcwzvgfx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<canonical publishable key>
```

Rules:

- never commit the publishable key into GitHub documentation or source solely to work around missing Vercel configuration
- never silently fall back to another Supabase project
- Production and Preview should be explicitly bound to the canonical project
- production environment mutation and redeployment require explicit Founder approval

## Readiness contract

`GET /api/ready` is the release gate.

A release is ready only when it returns HTTP 200 with:

```json
{
  "status": "ready",
  "database": "connected",
  "project_ref": "uakpqqardziifcwzvgfx"
}
```

HTTP 503 with `database=unconfigured`, `binding_mismatch`, or `unavailable` blocks promotion.

Supabase database health can be independently checked with `public.sv_app_readiness()`. Database health does not override a failed deployment readiness endpoint; both layers must be correct.

## Release verification sequence

1. Confirm GitHub `main` SHA.
2. Confirm the intended Vercel production deployment is built from that exact SHA.
3. Confirm required Vercel environment variables are bound to canonical Supabase.
4. Require `/api/ready` to pass the exact contract above.
5. Run available repository verification:
   - dependency install with lockfile enforcement
   - tests
   - lint/typecheck
   - Rule 77 / production gate where applicable
   - production build
   - security audit at the repository-approved threshold
6. Verify authentication and authorization against the canonical backend:
   - Founder/Admin
   - Creator
   - Buyer pending
   - Buyer approved
   - privileged invite-only roles
7. Verify role denial/fail-closed behavior.
8. Verify the requested revenue/business flow before calling the release GREEN.

## Database migration gate

Production migrations must not be applied merely because code or a preview deployment is green.

Before applying a production migration:

- inspect the exact migration from the reviewed branch/PR
- confirm it targets `uakpqqardziifcwzvgfx`
- identify affected tables/functions/policies/triggers
- verify rollback or forward-repair strategy
- obtain explicit Founder approval
- apply through Supabase migration tooling
- re-run Supabase security/performance advisors where relevant
- run the feature-specific E2E verification

For PR #43, required E2E evidence is Creator signup → Buyer pending → Admin/Founder approval → approved Buyer access, with unapproved Buyer denied.

## Production failure logic

If production `/api/ready` is red while Supabase `sv_app_readiness()` is green:

1. classify it as a deployment/configuration problem first
2. verify Vercel environment binding and deployed SHA
3. do not rewrite or replace the database as a first response
4. use known-green previews only as diagnostic evidence, not as proof that production is healthy
5. repair the smallest broken layer
6. redeploy only with the required approval
7. require the readiness contract again

## Product Design release gate

For UI/product changes, follow `docs/PRODUCT_DESIGN_BUILD_HANDOFF.md`.

A visual change is not complete from code alone. Require:

- selected visual target
- responsive implementation
- required UI states
- accessibility checks
- rendered comparison/design QA when the Product Design visual workflow is available
- Build Supervisor implementation verification

## Hostinger Mail boundary

Hostinger Mail is a StreamVista communication connector. Keep API credentials server-side. Do not expose tokens in the Vite bundle. Mail automation must preserve auditability and Founder gates for sensitive sends, contracts, rights, finance, refunds, and legal decisions.

## Approval gates

Explicit Founder approval is required before:

- changing Vercel Production environment variables
- triggering/promoting a production deployment
- applying a production Supabase migration
- changing DNS/domain configuration
- sending bulk/external production email campaigns
- creating/refunding payments or changing payment credentials
- importing or destructively modifying production data
- merging when the current task is intentionally held for review

## Current known blocker — 2026-08-15

Supabase is healthy, but the Vercel production alias `streamvista-black.vercel.app/api/ready` returns HTTP 503 with `database=unconfigured`. The next production action is to bind the canonical Vercel environment and re-run the readiness gate; do not change the database to solve this symptom.
