# StreamVista A2A Business & Revenue Agent Layer

## Purpose

Turn the existing StreamVista Creator / Marketplace / Sales / Payment surfaces into an **agent-to-agent business workflow** controlled by one canonical Business & Revenue Command Center.

The runtime is **single-queue by design**: detect → deduplicate → prioritize → safe action → verify → close → next. Individual leads, buyers, payments, outreach threads and technical incidents must not create separate scheduled watchers.

## Agent roles

- Revenue Orchestrator — owns commercial routing, priority and evidence gates.
- Creator Acquisition Agent — qualifies creator-side revenue opportunities and prepares the ₹25,000 OTT Readiness offer without making binding commitments.
- Rights & Catalog Agent — checks rights/readiness evidence and surfaces missing requirements; it never invents clearance.
- Buyer Match Agent — prepares buyer/content matches from verified catalog and lead data.
- Deal Desk Agent — prepares deal-room next actions and approval requirements; it does not finalize contracts automatically.
- Payment Agent — reconciles persisted payment facts and Razorpay verification state; it does not capture, refund or grant entitlements without authorization.
- Follow-up Agent — prepares evidence-backed follow-ups; it does not send external commercial communication unless an authorized workflow permits it.

## A2A protocol boundary

The service exposes an A2A-compatible JSON-RPC HTTP endpoint at `/a2a` and a public Agent Card at `/.well-known/agent-card.json`. The compatibility alias `/.well-known/agent.json` is also served.

Supported core methods:

- `message/send`
- `tasks/get`
- `tasks/cancel`

Production transport is HTTPS + JSON-RPC 2.0. The Agent Card advertises bearer authentication without exposing any secret.

## Persistent single queue

The implementation reuses the existing `sales_agent_queue` and `approval_queue` tables. No new production database schema is required for the A2A runtime.

Queue priorities remain:

`P0 → P1 → P2 → P3`

Task deduplication uses a deterministic business key derived from task type and entity identity. Tasks already queued, running or awaiting approval are not duplicated.

Claiming is optimistic and guarded by the current queue status plus attempt count so concurrent workers cannot both successfully claim the same item.

## Approval gate

These classes of work are fail-closed and enter `approval_queue` instead of executing:

- payment capture
- refunds
- role changes
- rights approvals
- deal finalization
- external creator ↔ buyer contact
- outbound email/messages
- contractual acceptance

## Evidence gate

No agent may claim:

- payment success
- payment verification
- collected revenue
- buyer intent
- rights clearance
- contract acceptance
- partnership completion
- production health

without system evidence.

Forecasts must remain labelled **FORECAST** and must never be presented as actual revenue.

## Technical boundary

GitHub / CI / build / auth / backend / database / API / deployment / hosting / security / runtime / release diagnosis belongs to **Technology Command**. A technical incident is surfaced here only through its business impact and follow-up requirement; it must not create a duplicate business or technical watcher.

## Production environment activation

The code is production-ready but remains fail-closed until deployment configuration is present:

- `SUPABASE_URL` must point to the canonical StreamVista/Crayons production project `uakpqqardziifcwzvgfx`.
- `SUPABASE_SERVICE_ROLE_KEY` must exist only in server-side deployment configuration.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` must be configured server-side for payment readiness.
- `A2A_SHARED_SECRET` must be provisioned as a Vercel/server environment secret and never committed.
- `A2A_PUBLIC_BASE_URL` must be the explicitly routed public HTTPS base URL for the A2A server.

The server readiness gate returns `503` until the canonical Supabase binding, payment configuration, and A2A configuration are present.

## Hostinger Mail boundary

Hostinger Mail may provide inbound business signals to the command center through the existing `/api/hostinger-incoming` receiver. A2A agents only prepare follow-up actions unless a separate authorized send workflow is explicitly invoked.

## Vercel boundary

The canonical Vercel project remains `streamvista`. A2A production activation requires the production domain to route to the same backend surface represented by `A2A_PUBLIC_BASE_URL` and the environment secret to be configured in the correct production environment.

## Supabase boundary

The runtime uses the existing production tables with RLS enabled. Authorization remains server-side and role-gated. No service-role credential is exposed to client code.

## Production certification standard

A2A is not considered live merely because the source code exists. Certification requires evidence for:

1. GitHub source and CI
2. Vercel production deployment
3. canonical production domain
4. Agent Card discovery
5. authenticated `message/send`
6. persistent queue creation and deduplication
7. `tasks/get` state retrieval
8. approval routing for high-risk actions
9. evidence-backed task completion
10. fail-closed behavior when dependencies are unavailable

## Result

**One Business & Revenue Command Center. One active business queue. Multiple specialist agent roles. One evidence and approval boundary. No duplicate watchers.**
