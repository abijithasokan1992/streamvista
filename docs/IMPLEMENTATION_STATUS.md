# StreamVista Implementation Status

*Last verified: 2026-08-15*

## Canonical source of truth

- Repository: `abijithasokan1992/streamvista`
- Default branch: `main`
- Current verified `main`: `3dc43a6a093d8713a7c73a848ed69c0cf510ff38`
- Canonical production web target: Vercel
- Canonical backend: Supabase project `uakpqqardziifcwzvgfx`
- Product Design → Build Supervisor operating contract: `docs/PRODUCT_DESIGN_BUILD_HANDOFF.md`

Legacy Firebase/mock/SQLite material may still exist in the repository for historical or local purposes. It is not current production truth unless explicitly promoted and independently verified.

## Verified GREEN evidence

### Supabase

- Project `uakpqqardziifcwzvgfx` is `ACTIVE_HEALTHY` in `ap-south-1`.
- `public.sv_app_readiness()` currently returns:
  - `database=connected`
  - `status=ACTIVE_HEALTHY`
- RLS is enabled on the inspected StreamVista application, marketplace, sales, finance, social, and private-document tables.
- Current production migration history includes the StreamVista auth/RBAC release hardening and later operational migrations.

### Vercel source binding

- Vercel project `streamvista` is connected to GitHub repository `abijithasokan1992/streamvista`.
- Production deployment `dpl_4ixV2yAqfMu1NBzNNoqDt87BnMeK` is `READY` and was built from exact current `main` SHA `3dc43a6a093d8713a7c73a848ed69c0cf510ff38`.
- The separate `streamvista-ai-chat` Vercel surface currently returns `/api/ready` with HTTP 200 and `status=ready`, `database=connected`, proving the canonical Supabase backend can be reached from a correctly configured StreamVista deployment.

### Hostinger Mail

- Current Hostinger API access can directly manage mailbox `abijithasokan@crayonspictures.com`.
- Verified mailbox organization includes the revenue/content/licensing lanes plus:
  - `11 StreamVista`
  - `12 Union Auto Spares`
  - `13 Company Admin`
  - `98 Automation Log`
  - `99 Newsletters`
- Hostinger Mail remains a connector inside StreamVista/Command Center rather than a separate app.

## P0 blocker

The Vercel production alias `streamvista-black.vercel.app/api/ready` currently returns HTTP 503:

```json
{"status":"not_ready","database":"unconfigured"}
```

This is a **Vercel production environment binding problem**, not evidence of a Supabase database failure.

Required production variables are:

- `VITE_SUPABASE_URL=https://uakpqqardziifcwzvgfx.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<canonical publishable key>`

The key must remain in Vercel environment configuration and must not be committed to GitHub documentation or source.

PR #46 (`chore(vercel): one-time canonical Supabase env bootstrap`) already contains a fail-closed implementation path for this binding. Its previous automated attempt did not mutate Vercel because the repository `VERCEL_TOKEN` secret was unavailable.

## Open release gates

### PR #43 — public signup roles and Buyer approval

PR #43 remains open/draft. It introduces explicit Creator/Buyer public signup, pending Buyer gating, and the migration `supabase/migrations/20260814_public_signup_roles_and_buyer_approval.sql`.

The migration has **not** been applied to canonical production Supabase. Required evidence before merge/promotion:

1. apply the reviewed migration only with explicit Founder approval
2. Creator signup succeeds
3. Buyer signup lands in pending state
4. Founder/Admin approval transition succeeds
5. approved Buyer gains access while unapproved Buyer remains denied

### Product Design

Product Design is now defined as a StreamVista department/workflow, not an application. Full visual ideation/prototype/design-QA work must use the Product Design visual workflow when available. Engineering must not claim design-QA completion without a selected visual target and rendered comparison evidence.

## Safety / explicit non-actions in this verification pass

- no production Vercel environment variable changed
- no production deployment triggered or promoted
- no domain/DNS changed
- no Supabase migration applied
- no production data mutated
- no authentication account created
- no Hostinger email sent, moved, deleted, or reclassified
- no mailbox/webhook secret created or rotated
- no pull request merged

## Exact next production action

With explicit Founder approval, bind the canonical Supabase URL and publishable key to the Vercel `streamvista` Production + Preview environments, redeploy the exact approved `main` source, and require `/api/ready` to return HTTP 200 with `status=ready`, `database=connected`, and canonical project ref before any later migration or release promotion.
