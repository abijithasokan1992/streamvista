# Crayons Pictures — Release Checklist

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
