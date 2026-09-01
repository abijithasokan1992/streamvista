# Crayons Pictures — Production Architecture

## Canonical product

**Crayons Pictures — Digital Studio / Virtual Production Studio**, operated on the StreamVista platform at `https://streamvista.in`.

Primary users: filmmakers, creators, AI video creators, YouTubers, influencers, studios, buyers, operators and administrators.

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
