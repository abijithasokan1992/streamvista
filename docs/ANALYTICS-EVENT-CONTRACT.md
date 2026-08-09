# StreamVista Analytics Event Contract

Status: instrumentation foundation. Business events are not production-verified until their source-of-truth reconciliation passes.

## Operating rule

Analytics must describe real business actions, not UI intent or placeholder interactions.

A completion event is emitted only after the authoritative operation succeeds. A button click, hover, modal open, mock response, optimistic UI state, or failed request must never emit a completion event.

## Canonical allow-list

| Event | Emit only when | Required reconciliation key |
| --- | --- | --- |
| `user_signed_in` | real authentication succeeds and an authorised session exists | stable application user ID |
| `content_viewed` | a real title/content detail or screening view is opened | `content_id` |
| `upload_started` | an actual file transfer/job starts | upload/job record ID |
| `upload_completed` | storage/backend confirms the upload completed | upload/job record ID |
| `rights_submitted` | rights declaration is committed to the authoritative database | rights record ID |
| `buyer_interest` | deliberate buyer interest/request is persisted | interest/request record ID |
| `lead_created` | CRM lead creation commits successfully | `lead_id` |
| `payment_completed` | trusted payment backend/provider confirms success | `payment_id` |

## Common properties

Every custom event uses `event_version: 1`, `app: streamvista-web`, and the deployment environment. Where available, include pseudonymous/stable actor ID, actor role, correlation ID, content ID, lead ID, payment ID, source record ID, and numeric INR value.

Do not send raw email addresses, phone numbers, bank details, contract text, credentials, tokens, confidential buyer terms, private rights documents, or content files to PostHog.

## Identity rule

Anonymous public browsing may remain anonymous. Identify only authenticated real users using a stable application UID or pseudonymous ID. Never identify mock users. Never use email or phone as the analytics distinct ID.

## Data-quality reconciliation

PostHog is an analytics processor, not the business system of record. Reconcile event records against the authoritative system:

1. `upload_completed` ↔ upload/storage/job records.
2. `rights_submitted` ↔ rights database records.
3. `lead_created` ↔ CRM records.
4. `payment_completed` ↔ payment-provider/backend records.

Counts alone are insufficient. Compare source record IDs to detect missing, duplicate, or incorrectly attributed events.

A business event is `VERIFIED` only when:

- the source operation is real and successful;
- one source record maps to one expected analytics event;
- required IDs/properties are present;
- test/mock traffic is excluded;
- sensitive data is absent;
- reconciliation shows no unexplained missing or duplicate records for the validation sample/window.

## Current repository warning

`src/services/database/index.ts` currently resolves both mock and Firebase modes to `mockDatabaseService`. Therefore CRM, rights, upload, buyer-interest, and payment completion events must not be wired to those UI flows as production-success events until a real backend implementation is bound and verified.

## Initial browser collection policy

PostHog browser bootstrap is privacy-first:

- SPA pageviews: enabled using history changes.
- Generic element autocapture: disabled.
- Session recording: disabled.
- Business events: explicit allow-list only.
- Missing `VITE_POSTHOG_KEY`: analytics disabled safely.

## Production verification gate

Before calling analytics production-ready:

1. Add the correct PostHog project token and host in the deployment environment.
2. Open the real deployed StreamVista domain and navigate multiple routes.
3. Confirm fresh `$pageview` events arrive from that domain.
4. Bind each business event only after its real backend operation exists.
5. Execute one controlled success case for each bound event.
6. Reconcile PostHog source record IDs against the source system.
7. Mark the event verified only after the reconciliation passes.
