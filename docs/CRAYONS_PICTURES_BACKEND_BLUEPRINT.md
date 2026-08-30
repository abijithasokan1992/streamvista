# Crayons Pictures — StreamVista Real Backend Blueprint

Status: BUILD FOUNDATION
Canonical base: `4b638391286d77a14ece191a532075dad6f6a35f`
Target production domain: `streamvista.in`

## Guardrails

- `main` remains untouched by this foundation build.
- No force-push or history rewrite.
- No production credentials or secrets are committed.
- No speculative production Supabase/RLS/Auth changes.
- No Razorpay production configuration changes.
- No mock/demo/placeholder backend behavior.
- Every runtime integration must be verified against the canonical repository before promotion.

## Target architecture

- `apps/web` — canonical web application surface.
- `apps/api` — canonical API runtime surface.
- `apps/expo` — Crayons Pictures mobile application.
- `apps/jobs` — heavy rendering worker.
- `packages/db` — database migrations/contracts.
- `packages/ui` — shared UI primitives.
- `packages/analytics` — PostHog/Amplitude integration.
- `packages/config` — shared configuration contracts.
- `supabase/` — migrations, functions, and storage policies.

## Backend domains

1. Titles and creator workspace
2. Rights and compliance
3. Payments and webhook persistence
4. AI jobs and credit accounting
5. Packaging and deliveries
6. Buyer portal
7. Marketplace
8. Investor interests
9. Intelligence/analytics
10. Authentication and role enforcement

## Build sequence

### Gate P0 — Runtime and revenue

1. Resolve canonical Vercel root/deployment configuration.
2. Deploy only after the canonical SHA is verified.
3. Verify `streamvista.in` reaches the intended application.
4. Verify `/api/*` reaches API handlers rather than the SPA fallback.
5. Verify payment order/verification/webhook behavior without changing production credentials.
6. Stop if any runtime contract fails.

### Gate P1 — Data foundation

Implement only after P0 passes:

- `sv_app_titles`
- `profiles`
- `sv_rights`
- `sv_compliance`
- `sv_deliveries`
- `sv_packaging_jobs`
- `sv_ai_jobs`
- `sv_ai_credits`
- `sv_buyers`
- `sv_marketplace_listings`
- `sv_investor_interests`
- `sv_intelligence`

Existing payment tables remain authoritative and must be reconciled before alteration:

- `sv_payments`
- `sv_payment_webhook_events`

### Gate P2 — AI foundation

- Authenticated AI job creation.
- Ten free credits per user as a product rule, subject to final database/RLS certification.
- Gemini proxy for lightweight operations.
- Queue-backed heavy jobs for dubbing, 2D-to-3D, anime, and multilingual rendering.
- No provider key exposure to clients.

### Gate P3 — Commerce and delivery

- Rights-controlled packaging.
- Compliance approval.
- Buyer-scoped deliveries.
- Marketplace listing lifecycle.
- Operator-approved investor interests.

### Gate P4 — Mobile, analytics, mail

- Expo authentication and signed media access.
- PostHog/Amplitude event instrumentation.
- Hostinger transactional mail.

## Evidence rule

A feature is **built** only when its code, tests, configuration contract, and runtime behavior are verified. A design, schema proposal, or local implementation is not production certification.

## Current repository reality

The canonical SHA currently contains a Vite application and `/api` handlers at repository root. The target `apps/web` / `apps/api` monorepo arrangement described above is therefore a target architecture, not an assertion that those paths already exist in the canonical SHA.

The current `vercel.json` defines a Vite build and excludes `/api/` from the SPA rewrite. Any routing change must preserve that distinction and be verified before promotion.
