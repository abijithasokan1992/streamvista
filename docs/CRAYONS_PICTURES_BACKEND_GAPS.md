# Crayons Pictures — Backend Gap Register

## Confirmed blockers found in the current repository

### P0 — Security
- Committed `apps/auto-api/.env` contained Oracle, OCI, Razorpay, Gemini, JWT and private-key material.
- Committed `apps/api/.env` contained Google API and JWT material.
- Committed `apps/api/google-service-account.json` contained a service-account private key.
- These credentials must be revoked/rotated outside GitHub. Removing files does not invalidate credentials that were already exposed.

### P0 — Production runtime
- `vercel.json` is configured as an SPA catch-all and previously did not expose the Express API as a first-class runtime.
- `apps/auto-api` contains a real Express API implementation, but its public production hosting path is not proven by the current Vercel project alone.
- Hostinger test delivery to `command.streamvista.in/api/hostinger-incoming` currently returns HTTP 404.
- The Hostinger webhook is therefore correctly kept paused until a real receiver is deployed.

### P0 — Fake/demo prevention
- The marketplace UI contains hard-coded film titles, prices and QC statuses.
- The production server previously seeded an enterprise catalog at startup.
- Oracle database code previously fell back to a random-ID mock implementation when credentials were absent.
- Storage status previously returned a hard-coded provider/bucket state.

### P1 — AI Studio
The current canonical `apps/auto-api/src/routes/ai.ts` exposes only disabled automotive endpoints returning HTTP 410. The requested Crayons Pictures AI Studio toolset is not yet a real backend feature set.

Required architecture:
- AI tool registry
- provider adapters
- persisted AI job records
- usage/cost accounting
- retry/cancellation states
- input/output asset references
- rights/consent gates
- operator approval for controlled tools

### P1 — Media execution
Heavy rendering cannot be implemented safely as a browser-only feature. A real execution worker is required for:
- FFmpeg media processing
- subtitle generation / muxing
- audio enhancement
- dubbing
- voice workflows
- image/video transformations
- 2D→3D conversion
- stylization
- packaging / delivery exports

The worker must write real output assets back to storage and update durable job state.

### P1 — Payments
Razorpay order creation and server-side signature verification code exists. Final certification still requires a live end-to-end checkout proof against the production hostname and confirmation that webhook events reconcile to `sv_payments` without duplicate grants.

### P1 — Analytics
PostHog is connected to an accessible default project but it has no StreamVista production event traffic in the current schema. A canonical event taxonomy must be instrumented and verified.

The accessible Amplitude project currently has zero events. Do not advertise Amplitude as active StreamVista analytics until a dedicated production project/event stream is established.

### P1 — Auth / authorization
The web client uses Supabase Auth session persistence, while the legacy Express API uses its own JWT path. The canonical production architecture should use Supabase Auth identity as the authority and map roles/workspaces server-side; do not maintain parallel user identity stores.

## Required target state

`streamvista.in` → Vercel web control plane

`/api/*` → one canonical production API hostname

Canonical API → Supabase Auth/Postgres/Storage + provider adapters

Long-running media jobs → dedicated worker/compute plane

Payments → Razorpay + durable ledger/webhooks

Mail → Hostinger webhook → canonical command/API receiver

Analytics → PostHog primary, Amplitude optional mirror

Expo → same API/domain contracts, no mobile-only business logic
