# Crayons Pictures — Release Checklist

## PR #125 reconciliation candidate — 2026-09-03

Base: `6fa0f369e75f0a460dd4a92b4aff027b6044a754` (`main`).
Compared candidate: `72fb4b2299a36aed43bf986199fcd7f7617e9af9` (PR #125).
This is a selective reconciliation on current main, not a merge of the old branch.
No production service, database, secret or domain is changed by this candidate.

| PR #125 file/group | Disposition and reason |
|---|---|
| `.github/workflows/crayons-production-gate.yml` | Fold build and security intent into existing `ci.yml`; do not add a duplicate workflow. Add regression tests and tooling lint. |
| `.gitignore` | Keep main's broader existing secret, binary and cache exclusions. |
| `apps/api/.env`, `apps/api/google-service-account.json` deletions | Already absent from main's tracked tree; do not recreate them. Other tracked configuration remains a security blocker. |
| `apps/api/src/server.js` deletion | Do not take the 2,550-line deletion. Preserve both legacy server entrypoints and record their security findings below. |
| `apps/api/src/config/productionContract.js` | Do not add a second runtime contract. Retain `apps/auto-api/src/lib/productionReadiness.ts`; configuration checks alone are not health evidence. |
| `apps/auto-api/src/config/db.ts` | Retain main's narrowed, validated Supabase configuration. Main has migrated the old raw-SQL callers, resolving the PR's argument-count compilation errors. |
| `apps/auto-api/src/services/AuthService.ts` | Keep main's profile-error handling and Supabase identity. |
| `apps/auto-api/src/server.ts` | Keep current route mounts, `req.user`, Vercel export, static serving and raw-body webhook handling. |
| `apps/auto-api/src/routes/ai.ts` | Keep the current provider gateway, capability names and `/api/ai-jobs` path. Do not replace them with the old competing gateway/queue contract. |
| `apps/auto-api/src/routes/payments.ts` | Keep main's payment router, plan prices, amount/ownership checks and response contracts. Old entitlement issuance must not be applied to authorized-only events. |
| `20260830_production_baseline.sql` | Preserve main's migration and newer schema; do not rewrite baseline policies. |
| `20260831_ai_usage_entitlements.sql`, `20260831_billing_entitlements.sql` | Not imported. Reconcile metering and entitlements with the existing production schema and ledger before proposing migrations. |
| `CRAYONS_PICTURES_PRODUCTION_PRODUCT_MAP.md`, `VERCEL_PROJECT_CONSOLIDATION.md` | Fold compatible product and deployment policy into the existing production architecture document. |
| `NEXT_STAGE_RELEASE_GATE.md` | Fold acceptance criteria here. Do not copy its unsupported “completed” claims. |

### Local validation and remaining blockers

- Full web and API build passes against the retained current implementation.
- Clean `npm ci`, `npm run build`, all five `npm test` cases, and `npm run lint`
  pass locally on Node 24.19.0. A compatible lockfile update of transitive `qs`
  from 6.15.3 to 6.16.0 resolves the reported moderate dependency advisory;
  `npm audit` reports zero known vulnerabilities for this root lockfile.
- Release regression tests cover retained AI/payment routes, missing-provider
  failures, checkout and raw-webhook signatures, and recursive tracked-file checks.
  They use local fixtures, not real providers or production payments.
- Tooling lint is limited to the new release scripts/tests/configuration. It is not
  a claim that every historical application has passed lint or authenticated E2E.
- The reused security policy from the existing release-blocker-remediation branch
  is intentionally enforced in CI. It currently blocks the inherited baseline:
  `.env.local`, generated/system state under `.codeoss/` and `gopath/`, token helper
  files, and fallback/mock authentication/payment patterns in both
  `apps/api/src/server.js` and `apps/api/src/server.ts`. Findings report paths and
  labels only, never credential values. These patterns require remediation or
  proven runtime isolation before release; reachability has not been certified.
- Targeted review of this candidate covers all ten changed files: existing CI is
  reused, tests use ephemeral credentials and local requests, diagnostics omit
  secret contents, and application/auth/payment/schema source is preserved. The
  security policy finds 7,990 inherited tracked-file violations, mostly generated
  system state. This is not a full repository security audit or production proof.
- No routes, production schemas or legacy server functionality are deleted to
  make the security gate green. Any destructive cleanup needs Founder approval.
- The GitHub connector reports `push: false`; an existing Git credential passed
  a non-interactive push dry run. Publish through that authenticated Git path and
  create a Draft PR. Local validation does not substitute for remote CI evidence.

### Evidence required after publication

1. Publish the reconciled branch as a Draft PR, retaining #125 as history until the
   replacement has been reviewed. Recheck main for intervening changes first.
2. Resolve security blockers without deleting functionality, then record passing
   build, regression tests, lint and security results for the exact PR head.
3. Verify that the production deployment and public alias serve that exact accepted
   commit and that public health checks pass.
4. Verify canonical Supabase mapping, migrations, RLS, storage and cross-user access.
5. Exercise Auth/RBAC, real AI execution and persisted failure/success states, the
   full Razorpay payment/webhook/persistence/entitlement chain, transactional mail,
   analytics and marketplace E2E. Record direct evidence for each gate.

Status: **NOT PRODUCTION CERTIFIED; release security blocked.**

## P0 — Must be true before production release

- [ ] Revoke and rotate every credential previously committed to Git history.
- [ ] Confirm no `.env`, service-account JSON, PEM, private key or provider secret is tracked.
- [ ] Deploy the canonical server API and prove `/api/health` from the public production hostname.
- [ ] Ensure `/api/*` requests do not fall through to the SPA.
- [ ] Bind production API to the canonical Supabase project.
- [ ] Remove Oracle/mock fallbacks from all code that can execute in production.
- [ ] Remove hard-coded marketplace content and use DB-backed catalogue queries.
- [ ] Enforce workspace/role/RLS checks server-side.
- [ ] Persist every AI operation as a job.
- [ ] Configure a real AI provider adapter for each enabled tool.
- [ ] Configure a real media render worker/provider for every heavy tool.
- [ ] Gate voice clone/dubbing behind explicit consent and rights state.
- [ ] Verify private storage, signed access and asset ownership.
- [ ] Verify Razorpay order creation, signature verification, webhook idempotency and payment persistence.
- [ ] Verify Hostinger webhook endpoint and activate only after a successful test delivery.
- [ ] Add production analytics events and verify they arrive in the intended analytics project.
- [ ] Run authenticated creator, buyer and admin E2E paths.
- [ ] Run a cross-user / cross-workspace access test.
- [ ] Confirm failed provider calls produce durable failed jobs, not false success.
- [ ] Confirm no fabricated metrics, sample films or fake QC badges appear in production.

## P1 — Required for the full studio product

- [ ] Asset proxy generation.
- [ ] Transcode / mezzanine / HLS pipeline.
- [ ] Subtitle generation and QA.
- [ ] Multi-language dubbing.
- [ ] DCP / IMF / delivery packaging.
- [ ] Secure screener access.
- [ ] Deal room and licensing workflow.
- [ ] Buyer discovery / matching.
- [ ] Distribution connectors.
- [ ] Usage metering and AI cost ledger.
- [ ] Notifications and mail ingestion.
- [ ] Operator approval queues.
- [ ] Audit timeline and compliance records.

## P2 — Mobile / growth

- [ ] Expo client consumes the same canonical API contracts.
- [ ] Push/deep-link lifecycle events are real.
- [ ] PostHog session/error analytics are live.
- [ ] Amplitude event mirroring is optional and uses the same event names.
- [ ] Product experiments use one flag system as the source of truth.

## Release status semantics

`VERIFIED` = observed against the real production system.

`CONFIGURED` = provider/configuration exists but live transaction has not been proven.

`BLOCKED` = missing runtime, credential, schema, policy or deployment dependency.

`DISABLED` = UI must not present this tool as available.

No module may display a successful completion state unless the backend has persisted evidence of the successful operation.
