# StreamVista Production Release Gate — 2026-09-02

Status: ready to verify; not final green.

This document records the current production evidence boundary for the canonical StreamVista release path. It is intentionally a release gate, not a rebuild plan.

## Canonical sources

- GitHub repository: `abijithasokan1992/streamvista`
- Default branch: `main`
- Canonical Vercel project: `streamvista`
- Vercel project ID: `prj_lgawdVnsYWLOOyoLubZkAt52qb1J`
- Public production domain: `https://streamvista.in`

## Current verified state

| Gate | Status | Evidence boundary |
|---|---:|---|
| GitHub canonical repository | Pass | `abijithasokan1992/streamvista` remains the canonical source repository. |
| GitHub `main` | Pass | `main` currently points at commit `253277145ae6a595dda1d066b1933f1c94c21daa`. |
| Vercel canonical project | Pass | Canonical project remains `streamvista`. |
| Prior Vercel production deployment | Pass | Vercel has a prior `READY` deployment from commit `8c3893203df27feea6de90675e4db49b5bb11b02`. |
| Latest main deployed to production | Blocked | Latest `main` is newer than the verified production deployment and still requires a successful Vercel deployment. |
| Public domain `streamvista.in` | Blocked | `https://streamvista.in/`, `/login`, and `/api/ready` returned Vercel 404 during the latest smoke check. |
| Supabase production schema and RLS | Verify | Integration exists, but the canonical production project, migrations, RLS, and grants must be verified directly. |
| Auth E2E | Verify | Code exists, but real-user production login and persistence must be verified on the public domain. |
| Razorpay E2E | Verify | Order, verification, webhook, durable payment record, and entitlement must pass with a real low-value payment. |
| Email E2E | Verify | Delivery and branded sender flow must be verified with the production account. |
| Analytics revenue funnel | Verify | Revenue events must be verified from authoritative outcomes only. |
| Final production release | Blocked | Final green requires every P0 gate above to pass with direct evidence. |

## Important correction

The deployed Vercel production commit and the current GitHub `main` commit are not the same.

- Verified deployed production commit: `8c3893203df27feea6de90675e4db49b5bb11b02`
- Current GitHub `main`: `253277145ae6a595dda1d066b1933f1c94c21daa`

Therefore, payment and revenue changes present on `main` must not be treated as production-live until Vercel successfully deploys the latest `main` and the public domain smoke test passes.

## Reuse-first implementation rule

The repository already contains the revenue and payment path. Do not create duplicate payment handlers, duplicate products, duplicate schemas, duplicate Supabase projects, or parallel auth systems.

Do not connect StreamVista, Crayons Bridge, Crayons Pictures, or Crayons Loop to the Union Auto Spares Supabase project `jpfyhahrdxbtwximsglj`; that database is for automobile inventory/order operations and is not the media-production platform data plane.

Use the existing implementation first:

- `/api/payment/create-plan-order`
- `/api/payment/verify-plan-payment`
- `/api/payment/webhook`
- `/api/payments/create-order`
- `/api/payments/verify`
- `sv_payments`
- `sv_payment_webhook_events`
- `sv_app_profiles`
- `onboarding_requests`

Product separation must be expressed through modules, route namespaces, domains, RBAC, and analytics namespaces while preserving one canonical identity, billing, and data boundary.

## Required release sequence

1. Attach and verify `streamvista.in` on the canonical Vercel project.
2. Verify DNS and SSL for `streamvista.in`.
3. Redeploy the latest GitHub `main` commit.
4. Run public-domain smoke tests for homepage, login, and API readiness.
5. Verify the canonical Supabase project, schema, grants, RLS, and storage policies.
6. Run authenticated persistence E2E on the public domain.
7. Configure Razorpay webhook to the production app endpoint: `https://streamvista.in/api/webhooks/razorpay`.
8. Run a real low-value Razorpay order to payment to webhook to durable record to entitlement test.
9. Verify analytics events from authoritative product and payment outcomes.
10. Declare final green only after every P0 gate passes.

## Release decision

Do not declare StreamVista officially released yet.

The correct release state is:

```text
READY TO VERIFY
        ↓
DOMAIN + SUPABASE + E2E + PAYMENT VERIFICATION
        ↓
ALL P0 GREEN
        ↓
FINAL GREEN
        ↓
OFFICIAL STREAMVISTA PRODUCTION RELEASE
```

## Final principle

Vercel `READY` proves a deployment exists. It does not prove `streamvista.in` is live, Supabase is correctly mapped, Auth works for real users, Razorpay revenue is durable, or analytics represent real outcomes.

No release declaration before final green.
