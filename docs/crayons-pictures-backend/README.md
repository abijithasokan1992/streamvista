# Crayons Pictures — Digital Studio Backend

## Production contract

Crayons Pictures is the production digital studio / virtual production backend for filmmakers, creators, AI video creators, YouTubers, and influencers.

### Non-negotiable rules
- Real backend only. No mock data or demo-only behavior in production paths.
- Supabase is the system of record for identity, RBAC, project metadata, rights, jobs, billing state, audit events, and tool execution records.
- Vercel is the public API/web runtime.
- Expo is the native client layer and consumes the same authenticated API/data contract.
- Heavy rendering is asynchronous and must be represented as persistent jobs with status, ownership, inputs, outputs, and audit evidence.
- AI provider credentials stay server-side; clients receive capability/result metadata, never provider secrets.
- Payments are authoritative only after verified Razorpay events.
- Hostinger Mail is the transactional communication channel; email delivery must be auditable.
- Amplitude/PostHog capture product usage without storing secrets or raw sensitive media.
- Operator approval is required for rights-sensitive marketplace actions, external side effects, and protected publishing/delivery operations.

## Module map

### Studio Core
- projects
- productions
- scenes
- assets
- files
- collaborators
- tasks
- production calendar

### Creator Tools
- script optimizer
- logline/synopsis generator
- 9:16 viral shorts writer
- shot-list / storyboard assistant
- production breakdown
- subtitle / caption preparation
- metadata / OTT package builder
- buyer-readiness checker

### AI Conversion Studio
- multilingual dubbing job
- voice transformation job
- lip-sync job
- 2D-to-3D/spatial conversion job
- cartoon/anime stylization job
- image/video enhancement job
- proxy/transcode/render job

### Crayons Bridge AI
- buyer matching
- rights-aware catalogue matching
- enquiry intake
- screening requests
- deal workflows
- controlled negotiation
- payment and delivery entitlements

### Control Plane
- identity
- organization membership
- role and capability checks
- connector registry
- agent capabilities
- approval queue
- audit events
- integration health
- analytics events

## Production data model

Preferred tables already present in the current Supabase contract include `sv_app_profiles`, `sv_app_titles`, `sv_title_rights`, `sv_title_reviews`, `sv_screening_requests`, `sv_marketplace_deals`, `sv_deal_offers`, `sv_deal_messages`, `sv_payments`, `sv_payment_webhook_events`, `sv_delivery_entitlements`, `sv_audit_events`, `onboarding_requests`, `connector_registry`, `agent_capabilities`, `approval_queue`, `integration_events`, and finance/CRM support tables.

New product tables must be added through versioned Supabase migrations and mirrored in generated TypeScript types. Do not create disconnected shadow schemas for the same business capability.

## API contract

Public Vercel API entrypoint: `/api/index.ts`

Required domain groups:
- `/api/health`
- `/api/readiness`
- `/api/auth/*`
- `/api/projects/*`
- `/api/assets/*`
- `/api/tools/*`
- `/api/jobs/*`
- `/api/bridge/*`
- `/api/payments/*`
- `/api/email/*`
- `/api/analytics/*`
- `/api/admin/*`

Authentication: Supabase access token in `Authorization: Bearer <token>`.
Authorization: server-derived role/capability checks; never trust client-supplied roles.

## Tool execution pattern

Every real AI/rendering capability should use:
1. request validation
2. entitlement/capability check
3. persistent job creation
4. provider dispatch server-side
5. status updates (`queued`, `running`, `needs_approval`, `completed`, `failed`, `cancelled`)
6. result metadata persistence
7. audit event
8. analytics event

No tool button may claim completion without a persisted successful job/result.

## Expo contract

Expo must consume the same production API/data layer. Do not duplicate business rules in the native client. Native storage is for session/UI/cache only; Supabase remains authoritative.

## Release gates

A production release is green only when:
- Vercel production build is passing.
- `/api/health` and `/api/readiness` are passing with real environment configuration.
- Supabase Auth login/session persistence works.
- RBAC and critical RLS policies are verified.
- Creator project/tool flow writes real records.
- AI job creation and status transitions are real.
- Razorpay order → checkout → verified payment/webhook → entitlement is real.
- Transactional email can be sent and recorded.
- Analytics events reach the configured analytics destination.
- No P0 security advisor findings remain unresolved.
- No production UI path depends on hardcoded mock/demo data.
