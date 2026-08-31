# Product Surfaces

This repository is a shared platform monorepo. The following customer-facing products are separate branded surfaces backed by the same core services.

| Product | Canonical surface | Purpose |
|---|---|---|
| StreamVista | `streamvista.in` | Platform / infrastructure / identity / billing |
| Crayons Pictures | `crayonspictures.com` | Digital film studio, AI filmmaking, virtual production |
| Crayons Bridge | `bridge.crayonspictures.com` | Rights, licensing, marketplace and deal room |
| Crayons Loop | `crayonsloop.com` | Distribution, FAST, OTT, channels, EPG, QC and delivery |
| Crayons Creator Cloud | `cloud.crayonspictures.com` | Storage, ingest, project assets, QC and delivery |

## Crayons Loop domains

- `crayonsloop.com` — canonical production domain.
- `crayonsloop.in` — secondary domain; redirect to `crayonsloop.com`.

## Shared services

Do not duplicate:

- StreamVista Identity / Auth
- Organization and RBAC
- Billing / Razorpay
- Entitlements
- Supabase/PostgreSQL data services
- Object/media storage
- AI services
- Media processing / QC
- Notifications
- Analytics
- API services
- Security and audit

## Routing principle

The same deployment can expose multiple branded surfaces by hostname while sharing the same service layer. Hostname should determine the active product shell/brand, not create a separate backend instance.

Example:

```text
streamvista.in       -> StreamVista shell
crayonspictures.com  -> Crayons Pictures shell
bridge.*             -> Crayons Bridge shell
crayonsloop.com      -> Crayons Loop shell
cloud.*              -> Creator Cloud shell
```

`crayonsloop.in` must canonicalize to `crayonsloop.com`.

## Implementation rule

Before adding new code, locate and compose existing pages/components/services. The repository already contains `apps/web/app/pages/CrayonsLoop.tsx`, which includes Loop QC queue, verification protocol and authenticated QC trigger wiring; preserve and promote that capability rather than rebuilding it.