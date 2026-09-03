# Crayons Pictures — Production Architecture

## Canonical product

**Crayons Pictures — Digital Studio / Virtual Production Studio**, operated on the StreamVista platform at `https://streamvista.in`.

Primary users: filmmakers, creators, AI video creators, YouTubers, influencers, studios, buyers, operators and administrators.

StreamVista Cloud X is the master control platform. Crayons Pictures and Crayons
Bridge remain product modules on the canonical identity, API and billing boundary.

## Revenue and deployment boundaries reconciled from PR #125

These are intended product capabilities, not assertions that the workflows are live.

| Capability | Customer | Revenue model |
|---|---|---|
| Creator Cloud | Creators and studios | Subscription, storage and usage |
| AI production tools | Creators and studios | Metered jobs and credits |
| OTT readiness and delivery | Content owners | Service and delivery packages |
| Crayons Bridge marketplace | Rights owners and buyers | Transaction/service fees |
| Studio operations | Production teams | Subscription and bookings |
| Enterprise workspace | Production companies | Contract pricing |

The canonical deployment target remains Vercel project `streamvista`, repository
`abijithasokan1992/streamvista`, branch `main`, domain `streamvista.in`. These are
intended bindings; verify the actual deployment SHA, alias, domain and backend
before promotion. Other projects must be classified as feature previews, reusable
source assets, experiments, or retirement candidates. Classification never
authorizes deletion. A separate production application needs a distinct customer,
domain, revenue path, data boundary, owner and its own verified release gate.

Reuse the existing AI provider gateway, `/api/ai` routes and `/api/ai-jobs`
persistence path. Do not introduce PR #125's competing `ai_jobs`/`ai_usage`
schema over the current `cps_ai_runs` path. Durable worker execution, allowance
accounting, ownership checks and provider completion remain release gates.

Billing must link the server-priced order to provider verification, durable payment
and webhook records, and the correct entitlement. A checkout signature, client
flag, or an `authorized` event alone does not certify a captured payment or grant
entitlement. Reconcile against the existing ledger and schema before adding tables.

## Non-negotiable production rules

1. No mock catalog data in production.
2. No fallback secrets or placeholder credentials.
3. No client-side provider secrets.
4. Every AI/media operation is a persisted job with status, owner, inputs, outputs, provider, error state and audit record.
5. Rights, consent and operator approval gate any sensitive media/voice workflow.
6. Supabase is the system of record for identity, workspace, rights, jobs, payments, entitlements and audit.
7. Vercel serves the web control plane; long-running media/AI work runs in a worker/execution plane, not inside a browser request.
8. Razorpay is the payment provider; successful payment must be independently verified and persisted.
9. Hostinger Mail ingress must return a deterministic success response and deduplicate incoming event IDs before activation.
10. Product analytics must distinguish product events from infrastructure telemetry.

## Canonical modules

### Core platform
- Identity / signup / session
- Workspace / organization membership
- RBAC / permissions / RLS
- Projects / titles / assets
- Rights / chain of title / consent
- Audit / approvals / notifications

### Creator Studio
- Project workspace
- Media ingest
- Asset vault
- Metadata
- QC submission
- AI tools
- Render job tracking
- Export / packaging

### AI Studio
- Script optimizer
- Logline / synopsis generation
- OTT buyer matching
- Short-form script generation
- Translation / localization
- Subtitle generation
- Dubbing orchestration
- Voice workflow with consent and rights gate
- Image / video transformation
- 2D→3D / stylization adapters
- AI job queue, usage and cost accounting

### Commercial
- Crayons Bridge marketplace
- Buyer portal
- Screening requests
- Deal room
- Offers / negotiation
- Licensing
- Razorpay checkout
- Entitlements
- Revenue reconciliation

### Distribution
- Packaging
- QC
- Delivery
- Watch / playback
- OTT / FAST distribution

### Command / operations
- Admin
- Intelligence
- Compliance
- Notifications
- Support / mail ingress
- Observability / analytics

## Execution architecture

```text
Browser / Expo
      |
      v
Vercel Web Control Plane
      |
      +---- Supabase Auth + Postgres + Storage
      |
      +---- API / Server Actions
      |
      +---- Provider adapters
                 |
                 +---- Gemini / LLM
                 +---- ASR / TTS / Dubbing provider
                 +---- Image / video transformation provider
                 +---- Render Worker / FFmpeg / GPU provider
                 +---- Razorpay
                 +---- Hostinger Mail
                 +---- PostHog / Amplitude
```

## AI job contract

Every heavy operation must create a job before execution:

- `id`
- `workspace_id`
- `created_by`
- `tool_key`
- `provider`
- `status`: `queued | running | succeeded | failed | cancelled`
- `input_asset_ids`
- `input_text`
- `parameters`
- `output_asset_ids`
- `usage_units`
- `estimated_cost`
- `started_at`
- `completed_at`
- `error_code`
- `error_message`
- `approval_required`
- `approved_by`
- `created_at`

## Provider policy

The UI may expose a tool only when its backend adapter is configured and the required provider credential is present server-side. Unconfigured tools must display `Unavailable in this deployment` rather than pretending to execute.

## Analytics contract

PostHog is the operational product-analytics system when connected. Amplitude may mirror canonical product events, but must not become a second conflicting taxonomy.

Recommended event families:

- `workspace_created`
- `project_created`
- `asset_uploaded`
- `ai_tool_opened`
- `ai_job_created`
- `ai_job_started`
- `ai_job_succeeded`
- `ai_job_failed`
- `render_job_created`
- `render_job_succeeded`
- `checkout_started`
- `payment_verified`
- `deal_created`
- `screening_requested`
- `delivery_created`
- `mail_ingress_received`
- `mail_ingress_processed`

Never send secret values, raw payment credentials, private media bytes, or sensitive rights documents as analytics properties.

## Release gate

A release is green only when all of the following are proven against production:

- Web build succeeds
- Supabase auth/session works
- RLS prevents cross-workspace access
- Real title/project creation works
- Real asset upload works
- AI text tool calls a real provider and persists a real result
- Heavy tool creates a real job and reaches a real terminal state
- Razorpay payment is server-priced, signature-verified and persisted
- Hostinger webhook returns success and deduplicates
- Admin approval/audit records are persisted
- PostHog/Amplitude events are actually received in the intended project
- No committed secrets remain
- No mock/fake datasets are rendered in production
