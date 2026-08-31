# STREAMVISTA FILM OS — Production Release Contract

## Product

**STREAMVISTA FILM OS**

The operating system for AI-assisted film production.

## Canonical flow

`Idea → Script → Pre-Production → Production → Post → Localization → QC → Final Master → Buyer → Revenue`

## Canonical project lineage

`Project → Script Version → Scene → Shot → Asset → AI Run → Approved Asset → Edit Version → Master → Deliverable`

All generated or edited work must retain project identity, actor identity, instructions, inputs, output lineage, provider/model, timestamp, cost/usage, version and approval state.

## Human approval gate

`DRAFT → AI GENERATED → REVIEW → APPROVED → LOCKED → DELIVERED`

Critical approval gates:

- Script
- Character / World Bible
- Visual Assets
- Shot
- Edit
- Audio
- Localization
- Rights
- QC
- Final Master

## Production modules

- Development
- Pre-Production
- Production
- Post
- Localization
- QC + Delivery
- Rights
- Buyers
- Billing
- Analytics
- Admin

## Canonical infrastructure

- GitHub — source, migrations, release history
- Vercel — production application and deployment
- Supabase — auth, PostgreSQL, RLS, storage metadata
- Razorpay — payments and commercial activation
- Remotion — composition, preview and rendering
- Amplitude / PostHog — canonical analytics event plane
- Exa — research / grounding
- Hostinger Mail — transactional mail

## Non-negotiable rules

1. Never ship mock production data in place of the real database.
2. Never bypass project/org RBAC or RLS.
3. Never let AI output silently become production truth.
4. Reuse existing StreamVista capabilities before introducing duplicates.
5. Keep payment amounts and entitlements authoritative on the server.
6. Keep secrets out of source control and client bundles.
7. Keep the product graph connected across every department.
8. Promote to production only after end-to-end verification.

## Release acceptance

The release is production-ready only when all are green:

- GitHub source
- Database schema
- Supabase RLS
- Auth / RBAC
- Real project data
- AI workflows
- Asset storage
- Payments
- Rendering
- QC
- Production deployment
- Domain
- Analytics
- End-to-end user flow

## Final acceptance path

`Create Project → Generate → Review → Approve → Produce → Edit → Localize → QC → Master → Pay → Deliver`

## Current implementation baseline

The canonical repository contains the Film OS application route and Supabase-backed project workspace. The production database contains the Film OS core graph and RLS-enabled tables.

This document is the release contract; it is not a claim that every acceptance gate is currently green.