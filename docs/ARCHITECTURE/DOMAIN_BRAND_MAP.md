# StreamVista Product & Domain Map

Status: canonical architecture baseline

## Brand hierarchy

- STREAMVISTA — parent visual-content platform and identity layer
- CRAYONS PICTURES — creation, AI and virtual production studio
- CRAYONS BRIDGE — rights, buyer matching, marketplace and deal room
- CRAYONS LOOP — QC, packaging, delivery and distribution

## Domains

| Product | Canonical domain | Existing fallback/domain | Vercel project | Backend namespace |
|---|---|---|---|---|
| StreamVista | streamvista.in | streamvista*.vercel.app | streamvista | platform |
| Crayons Pictures | crayonspictures.in | pictures.streamvista.in (recommended future alias) | shared canonical project unless independently promoted | pictures |
| Crayons LOOP | crayonsloop.in | crayonsloop.com | shared canonical project unless independently promoted | loop |
| Crayons Bridge | bridge.streamvista.in (recommended) | existing Crayons Bridge Supabase project is uakpqqardziifcwzvgfx | shared canonical project unless independently promoted | bridge |

## Infrastructure rule

One canonical GitHub monorepo and one canonical production application backend should provide shared identity, database, storage, audit, billing and analytics. Product separation is expressed through modules, route namespaces, domains, RBAC and analytics event namespaces.

Do not create separate databases solely because a product has a separate domain.

## Product route namespaces

### Crayons Pictures
- /pictures
- /pictures/studio
- /pictures/creator
- /pictures/ai
- /pictures/projects
- /pictures/assets
- /pictures/production
- /pictures/post

### Crayons Bridge
- /bridge
- /bridge/rights
- /bridge/marketplace
- /bridge/buyer
- /bridge/deals
- /bridge/licensing

### Crayons LOOP
- /loop
- /loop/qc
- /loop/packaging
- /loop/deliveries
- /loop/distribution

## Analytics namespaces

- pictures_* — creator, production and AI events
- bridge_* — rights, buyer, deal and payment events
- loop_* — QC, packaging, delivery and distribution events
- platform_* — identity, onboarding, billing and cross-product events

## Hosting rule

Vercel is the canonical web deployment platform. GitHub main is the canonical source. Production promotion must use a verified commit and must not promote experimental branches directly.

## Security rule

Supabase Auth is the canonical user identity. PostgreSQL/RLS is the canonical authorization boundary. Service-role credentials remain server-side only. No client-side secrets. No mock-data success paths in production.

## Hostinger mail rule

Use product-specific branded sender identities while keeping one communication infrastructure:
- hello@streamvista.in
- studio@crayonspictures.in
- bridge@streamvista.in
- delivery@crayonsloop.in
