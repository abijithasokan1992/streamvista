# GitHub Write Instructions — StreamVista Product Factory

## Purpose

This document is the default engineering instruction for changes made in the `abijithasokan1992/streamvista` repository.

## Core rule

**Never rebuild from zero. Always compose from existing working source.**

Before creating new code:

1. Search the repository for an existing component, page, API, service, migration, workflow, or utility that already solves part of the requirement.
2. Reuse or extend compatible source before generating replacement code.
3. Preserve working behavior unless the requested change explicitly requires a behavior change.
4. Keep changes scoped to the smallest production-safe surface.

## Brand and product architecture

Keep the shared StreamVista platform/core unified. Customer-facing brands and domains may be separated, but do not fork or duplicate:

- authentication and sessions
- organizations and RBAC
- billing and Razorpay
- subscriptions and entitlements
- storage and media services
- AI/media infrastructure
- API/service layer
- analytics/event pipeline
- notifications/email
- audit and security infrastructure

Use the existing brand architecture document as the source of truth: `docs/BRAND_PRODUCT_ARCHITECTURE.md`.

## Product boundaries

Each product may own its own:

- customer-facing UI
- navigation
- terminology and product vocabulary
- workflows
- route/domain presentation
- product-level analytics dimensions

Reuse shared platform packages and services underneath those boundaries.

## Canonical protection

Do not modify canonical or already-working platform code merely to create a new brand surface.

When an existing canonical capability is useful:

- consume it
- wrap it with a product-specific adapter where necessary
- expose only the required product surface
- do not duplicate its implementation

If a canonical area must change, make the smallest compatible change and preserve backward compatibility unless the requirement explicitly authorizes a breaking change.

## Production write sequence

For every implementation request:

1. Inspect the current repository state.
2. Identify the exact product/domain/module affected.
3. Search for reusable implementations.
4. Make the smallest required write.
5. Keep secrets, credentials, and environment values out of source control.
6. Update documentation when architecture or behavior changes.
7. Prefer additive changes over destructive rewrites.
8. Verify the changed files and surrounding integration points before promotion.

## Quality gate

A change is not considered complete merely because code was written. Verify, where available:

- type/build correctness
- API contract compatibility
- authentication/session behavior
- RBAC and RLS expectations
- payment/billing boundaries
- domain routing behavior
- analytics instrumentation
- production configuration assumptions

Do not claim production readiness without evidence.

## Domain rules

Domain separation is a customer-experience boundary, not a backend duplication boundary.

For Crayons products:

- `streamvista.in` remains the parent/platform surface.
- `crayonspictures.com` is the Crayons Pictures digital film studio surface.
- `bridge.crayonspictures.com` is the Crayons Bridge rights/licensing surface unless a dedicated Bridge domain is formally adopted.
- `crayonsloop.com` is the canonical Crayons Loop production domain.
- `crayonsloop.in` redirects to `crayonsloop.com` and does not create a second application or account system.
- `cloud.crayonspictures.com` is the Creator Cloud surface.

## Analytics rule

Use one shared analytics plane. Distinguish product journeys using dimensions such as:

```text
brand = streamvista | crayons_pictures | crayons_bridge | crayons_loop
product = studio | creator_cloud | marketplace | distribution
```

Cross-product journeys must remain measurable.

## GitHub change hygiene

When writing to GitHub:

- use descriptive commit messages
- keep commits focused
- avoid unrelated formatting churn
- never commit secrets or local `.env` files
- do not silently overwrite existing work
- preserve the repository's established conventions

## Default interpretation of “write”

When the request is simply to **write** a GitHub change, interpret it as:

**inspect -> reuse -> implement minimally -> document -> verify**

Do not introduce a new framework, duplicate service, duplicate auth system, or parallel product backend unless the requirement explicitly calls for it and the architecture is updated accordingly.
