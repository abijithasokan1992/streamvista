# Crayons Pictures — Production Backend Boundary

## Product contract
Crayons Pictures is the creator-facing Digital Studio surface for filmmakers, AI video creators, YouTubers and influencers. It must use real persisted data and real provider execution. No mock responses are allowed in production.

## Runtime boundary

- **Web:** React/Vite on Vercel.
- **Mobile:** Expo/React Native client in `apps/mobile` (introduced only when the mobile client is built).
- **API gateway:** `apps/auto-api` for synchronous auth, projects, billing, orchestration and short requests.
- **System of record:** Supabase/Postgres for identity-linked product state, jobs, usage, rights and audit data.
- **Media storage:** OCI/S3-compatible object storage; provider is configured with environment variables.
- **Long-running render:** dedicated worker/runtime, never simulated in a Vercel request. Queue state lives in Postgres.
- **Transactional mail:** Hostinger Mail SMTP/API via server-side credentials only.
- **Payments:** Razorpay with signature verification, webhook idempotency and server-side pricing.
- **Analytics/observability:** PostHog as the primary product analytics and feature-flag layer; Amplitude remains an explicit secondary sink only when enabled.

## Core modules

1. Identity & workspaces — signup, login, profiles, workspace membership, roles.
2. Studio projects — project metadata, scripts, shot lists, scenes, versions.
3. Asset vault — uploads, media metadata, proxies, captions, transcripts, derived assets.
4. AI workspace — chat, structured generation, prompt/version history, provider/model routing, usage metering.
5. Production tools — script optimizer, logline/synopsis, shorts script, storyboard, shot planning, subtitle/translation, metadata/QC helpers.
6. Render jobs — queue, attempts, progress, worker heartbeats, outputs, failures and retries.
7. Voice/dubbing — job orchestration and provider adapter; source/target language, consent metadata and outputs.
8. Spatial/3D — job orchestration and provider adapter; input asset, model/preset, output asset.
9. Stylization — job orchestration and provider adapter; image/video input and output lineage.
10. Rights & compliance — ownership, chain-of-title, territories, exclusivity, approvals and audit.
11. Marketplace/Bridge — buyer discovery, screening requests, deal room, offers, entitlements.
12. Commerce — plans, subscriptions, checkout, invoices, payments, refunds, webhook ledger.
13. Notifications — in-app + transactional email.
14. Analytics — canonical event taxonomy and provider sinks.
15. Admin/Founder Control — approvals, incidents, provider health, billing health, queue health and audit.

## Production invariants

- Missing secrets fail closed at startup.
- Missing Oracle credentials never switch the application into mock mode.
- Payment amount is calculated server-side and stored with an immutable order reference.
- Razorpay webhooks are verified from the raw request body and deduplicated by provider event id.
- Service-role keys are server-side only; browser code uses public Supabase configuration only.
- RLS is mandatory for user/workspace-owned records.
- Public/anonymous access is allowlisted per endpoint/table; default access is deny.
- AI endpoints never fabricate provider success when a provider is not configured or execution fails.
- Long-running media work is represented as a persisted job; the client polls/subscribes to state.
- User-facing errors do not expose stack traces, credentials, SQL or provider secrets.

## AI provider contract

Each AI capability is represented by:

`capability -> provider -> model -> input schema -> output schema -> usage meter -> artifact lineage`

The API should return an explicit `provider_not_configured` or `execution_failed` state rather than a fake result. Providers are selected by server configuration and can be swapped without changing the client contract.

## Analytics event baseline

`sign_up_started`, `sign_up_completed`, `workspace_created`, `project_created`, `asset_uploaded`, `ai_run_started`, `ai_run_succeeded`, `ai_run_failed`, `render_started`, `render_completed`, `render_failed`, `checkout_started`, `payment_succeeded`, `payment_failed`, `subscription_activated`, `screening_requested`, `deal_created`, `delivery_granted`.

## Release gate

Production is not considered ready until all of these are green:

- GitHub build/test
- Vercel production deployment
- Supabase schema + RLS + function security audit
- Auth E2E
- AI real-provider smoke test
- Media upload smoke test
- Render queue smoke test with real worker
- Hostinger transactional email smoke test
- Razorpay order/signature/webhook smoke test
- PostHog/Amplitude event ingestion
- Error tracking and rollback path
