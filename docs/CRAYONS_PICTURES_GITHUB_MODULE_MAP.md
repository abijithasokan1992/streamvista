# Crayons Pictures — GitHub Module Map

This is the canonical ownership map for production work. A module is releaseable only when its UI, data model, server contract, provider adapter, audit path and analytics events are all connected.

| Product area | UI route | Source area | System of record | Execution / provider | Release rule |
|---|---|---|---|---|---|
| Identity | `/login`, `/signup`, `/profile` | `apps/web/app/pages`, `apps/web/app/lib/supabase.ts` | Supabase Auth + profiles | Supabase | No local-only auth |
| Creator Studio | `/creator-studio` | `apps/web/app/pages/CreatorStudio.tsx` | `sv_app_titles`, assets | Supabase Storage / API | No placeholder records |
| AI Studio | `/ai-studio` | `apps/web/app/pages` + `apps/auto-api/src/routes` | AI job tables | AI provider adapter | Tool disabled unless backend exists |
| Crayons Bridge | `/crayons-bridge`, `/marketplace` | `apps/web/app/pages/marketplace` | rights / titles / deals | Supabase + API | Catalog must be DB-backed |
| Buyer Portal | `/buyer-portal` | buyer UI module | screening / deals | Supabase | Rights-gated access |
| Packaging | `/packaging` | packaging UI/service | packaging jobs | worker | Output artifact must exist |
| Distribution | `/distribution` | distribution UI/service | deliveries | worker/provider | No fake delivery state |
| Deliveries | `/deliveries` | delivery UI/service | entitlements/deliveries | storage/provider | Audit every handoff |
| Compliance | `/compliance` | compliance UI/service | approvals/audit | Supabase | Human approval for controlled actions |
| Watch | `/watch` | playback UI | asset entitlements | storage/CDN | Tokenized/private access |
| Store | `/store` | commerce UI | orders/payments | Razorpay | Server-priced checkout |
| Intelligence | `/intelligence` | ops UI | analytics/audit | PostHog + Supabase | Real events only |
| Admin | `/admin` | admin UI | roles/audit | Supabase RLS | Least privilege |
| Investors | `/investors` | investor UI | approved reporting | Supabase | No fabricated metrics |

## AI tool registry

Each AI tool should be represented by a single registry entry rather than bespoke frontend logic:

- `tool_key`
- display name
- category
- required input types
- output types
- provider adapter
- sync/async mode
- estimated cost unit
- entitlement requirement
- rights/consent requirement
- enabled state
- failure mode

Initial tool keys:

- `script.logline`
- `script.synopsis`
- `script.shorts_9x16`
- `marketplace.buyer_match`
- `localization.subtitle`
- `localization.translation`
- `localization.dubbing`
- `voice.clone`
- `media.audio_enhance`
- `media.2d_to_3d`
- `media.anime_stylize`
- `media.video_transform`

The browser must never claim a tool is "connected" merely because a UI card exists. `enabled` is derived from backend readiness.

## Repository cleanup policy

- Legacy `apps/api` is not the canonical production API and must not own new business logic.
- `apps/auto-api` is the current server implementation, but it must not retain mock-mode fallbacks.
- Secrets, `.env` files, service-account keys and private keys are never committed.
- `vercel.json` must not rewrite API paths to the SPA root when real API routes are expected.
- Long-running rendering is never executed in a Vercel request handler or browser tab.

## Pull request structure

Use focused production PRs in this order:

1. `security/secret-removal`
2. `platform/api-routing`
3. `platform/supabase-rls`
4. `studio/ai-job-contract`
5. `studio/ai-provider-adapters`
6. `studio/render-worker`
7. `bridge/db-backed-marketplace`
8. `commerce/razorpay-e2e`
9. `ops/hostinger-ingress`
10. `analytics/posthog-amplitude`
11. `mobile/expo-client`
12. `release/production-e2e`

Do not merge a dependent PR when its provider or database contract is still a mock, placeholder, or unverified runtime.
