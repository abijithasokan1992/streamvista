# Crayons Pictures — Next Stage Release Gate

## Stage
PRODUCTION-WIRING / REVENUE-SAFE

## Canonical boundary
- `main` is not modified by this stage.
- Production target remains the existing `streamvista` Vercel project and `streamvista.in`.
- Preview/experimental Vercel projects are source/reference material, not competing production products.

## Completed in this stage
- Supabase-backed API initialization with fail-closed configuration.
- Supabase Auth bearer-token verification instead of a second application JWT identity system.
- Persistent AI job creation for heavy tools.
- Real Vercel AI Gateway provider contract for instant AI tools; no fake output.
- Server-side daily instant-AI allowance enforcement.
- AI usage ledger.
- Razorpay signature verification remains fail-closed.
- Payment verification/capture now issues persisted entitlements.
- Entitlements are read-only to clients through RLS.
- Production documentation and consolidation policy are versioned in GitHub.

## Remaining evidence before production promotion
1. Apply and verify all Supabase migrations in the canonical production project.
2. Confirm RLS policies and storage policies against the deployed schema.
3. Configure and verify production environment variables, including `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, Razorpay credentials, and the AI Gateway credentials/model.
4. Run API build and application tests in CI.
5. Run authenticated signup/login E2E against production.
6. Run AI generation E2E and verify persisted `ai_jobs` + `ai_usage`.
7. Run Razorpay test payment/webhook E2E and verify entitlement issuance.
8. Verify Hostinger transactional email logging and delivery.
9. Verify Amplitude/PostHog events using the agreed internal analytics interface.
10. Verify the production domain/deployment mapping and runtime health.

## Promotion rule
Do not merge or declare production green until the evidence above is recorded. A missing secret, provider, migration, RLS policy, worker, payment entitlement, or analytics proof is a release blocker—not a reason to add a mock.
