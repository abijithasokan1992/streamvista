# Crayons Pictures — Production Product Map

## Guardrails
- This branch is a production-preparation slice. Do not modify canonical `main` directly.
- Reuse existing StreamVista/Crayons Bridge functionality before adding new implementation.
- No fake, demo, hard-coded, in-memory, or fabricated production state.
- Supabase/Postgres is the application source of truth.
- Web, Admin, and Expo use the same canonical API/auth/data model.

## Product hierarchy
1. StreamVista Cloud Studio OS — infrastructure/platform layer
2. Crayons Pictures — Digital Studio — creator/studio product layer
3. Crayons Bridge — rights, marketplace and buyer workflow layer
4. Crayons AI Engine — AI assistance and asynchronous media-processing layer

## High-value revenue products
| Product | Buyer | Monetization | Core backend |
|---|---|---|---|
| Creator Cloud | filmmakers, creators, studios | subscription + storage/usage | workspaces, projects, assets, entitlements |
| AI Production Tools | creators/studios | credits + metered jobs | ai_jobs, usage_ledger, provider_runs, cost_events |
| OTT Readiness / Delivery | content owners | one-off service + package | rights, QC, metadata, deliveries, invoices |
| Crayons Bridge Marketplace | rights owners + buyers | transaction/service fee | titles, rights, submissions, deals, contracts |
| Studio Operations | studios | subscription + booking | resources, reservations, billing |
| Enterprise | production companies/teams | contract pricing | tenant/RBAC/audit/usage |

## Capability families
### Free public AI
- logline
- synopsis
- 9:16 short script
- title/metadata enrichment
- buyer match
- captions/descriptions
- screenplay assistance

### Paid/internal AI jobs
- dubbing
- voice workflows
- subtitles
- translation
- audio cleanup
- upscaling
- HDR enhancement
- 2D→3D spatial processing
- cartoon/anime stylization
- QC
- delivery packaging

## Required API capability groups
- `/api/auth/*`
- `/api/workspaces/*`
- `/api/projects/*`
- `/api/assets/*`
- `/api/ai/*`
- `/api/bridge/*`
- `/api/marketplace/*`
- `/api/studio/*`
- `/api/billing/*`
- `/api/deliveries/*`
- `/api/notifications/*`
- `/api/admin/*`
- `/api/health`

## Async AI contract
Every heavy job persists:
- id
- tenant_id
- project_id
- asset_id
- tool
- provider
- status
- progress
- input
- output
- started_at
- completed_at
- error
- cost
- created_by

Lifecycle: `queued -> running -> qc -> completed | failed | cancelled`.

## Billing contract
Plan -> checkout -> Razorpay order -> payment/webhook -> persisted payment event -> subscription/purchase -> entitlement -> usage allowance.
Browser state never grants paid access.

## Analytics contract
Create one internal analytics adapter. Emit exact project-supported event names only after discovery. Primary product signals:
- signup
- onboarding_completed
- project_created
- asset_uploaded
- ai_tool_opened
- ai_job_created
- ai_job_completed
- ai_job_failed
- checkout_started
- payment_success
- subscription_started
- buyer_submission_created
- deal_room_opened
- delivery_created

Use Amplitude for product analytics and PostHog for experiments/feature flags/session/product diagnostics when connected.

## Vercel topology
- `streamvista` is the canonical Vercel project for `streamvista.in`.
- Additional Vercel projects are treated as previews, experiments, or source assets unless separately certified as a product.
- Avoid deploying duplicate production applications with overlapping functionality.
- Heavy render workloads must not depend on a long-lived Vercel request; Vercel orchestrates, persistent worker/compute performs the render.

## Release acceptance
A product slice is production-ready only when its frontend, API, database/RLS, storage, billing, analytics, email, permissions, and failure paths are all real and verified.
