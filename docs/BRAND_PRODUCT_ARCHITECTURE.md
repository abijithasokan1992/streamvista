# StreamVista Brand & Product Architecture

## Decision

Separate the customer-facing products and domains, but keep one shared platform/core. Do not fork the backend or duplicate authentication, billing, storage, analytics, media, AI, or infrastructure services.

## Brand hierarchy

### STREAMVISTA
- Domain: `https://streamvista.in`
- Role: Parent company, infrastructure and platform layer
- Owns: Identity, organizations, RBAC, billing, storage, analytics, AI/media infrastructure, APIs, integrations and shared platform services.

### CRAYONS PICTURES
- Domain: `https://crayonspictures.com`
- Role: Digital Film Studio / AI Filmmaking / Virtual Production
- Product areas: Studio, AI film tools, virtual production, creator workspace, creator cloud.

### CRAYONS BRIDGE
- Primary product surface: `bridge.crayonspictures.com` (or a future dedicated Bridge domain)
- Role: Rights, licensing and film marketplace
- Product areas: Catalog, rights, seller onboarding, buyer network, deal room, licensing, commercial workflows.

### CRAYONS LOOP
- Primary domain: `https://crayonsloop.com`
- Secondary domain: `https://crayonsloop.in`
- Role: Distribution, FAST, OTT and channel operations
- Product areas: Channels, programming, EPG, QC, metadata, distribution, delivery, monetization and channel operations.

### CRAYONS CREATOR CLOUD
- Product surface: `cloud.crayonspictures.com`
- Role: Creator storage, ingest, QC pipeline, project assets and delivery.

## Unified identity and account model

All branded products use the same StreamVista identity and organization model. A user signs in once and receives product access through organization-level entitlements and RBAC.

Flow:

`Brand domain -> StreamVista Identity -> Organization -> Entitlements/RBAC -> Product workspace`

Users must not be required to create separate accounts for Pictures, Bridge, Loop or Creator Cloud.

## Shared platform boundary

Keep these shared across products:
- Authentication and session management
- Organizations and RBAC
- Billing and Razorpay
- Subscription / entitlement service
- Storage and media asset services
- AI services
- Media processing and QC infrastructure
- Notifications/email
- API gateway and service layer
- Analytics/event pipeline
- Audit/security infrastructure

## Product boundary

Each product owns its customer-facing UI, navigation, feature vocabulary, workflows and product telemetry dimensions, while reusing the shared platform packages.

Suggested monorepo shape:

```text
/apps
  /streamvista
  /crayons-pictures
  /crayons-bridge
  /crayons-loop

/packages
  /auth
  /billing
  /ui
  /analytics
  /media
  /ai
  /storage
  /rights
  /distribution
```

The current repository already contains a Crayons Loop page at `apps/web/app/pages/CrayonsLoop.tsx` and existing API/QC services. Treat these as reusable source assets; do not rebuild them from zero.

## Crayons Loop domain rules

`crayonsloop.com` is the canonical public production domain for Crayons Loop.

`crayonsloop.in` is a secondary domain. It should redirect to the canonical `.com` domain and must not create a second independent application or account system.

The Loop product should be presented as:

**CRAYONS LOOP**

**Distribution Infrastructure for Film & Visual Content**

Core workflows:
1. Content intake / ingest
2. Asset validation and QC
3. Metadata normalization
4. Rights and delivery readiness checks
5. Programming / channel scheduling
6. EPG management
7. OTT / FAST delivery
8. Distribution tracking
9. Monetization and reporting
10. Operational monitoring

## Analytics

Keep one shared analytics data plane. Distinguish events using dimensions such as:

```text
brand = streamvista | crayons_pictures | crayons_bridge | crayons_loop
product = studio | creator_cloud | marketplace | distribution
```

Cross-product journeys must remain measurable, such as Pictures -> Bridge -> Loop.

## Non-negotiable engineering rules

- Never fork the platform merely to create a new brand.
- Never duplicate auth, billing, storage, analytics or core APIs.
- Reuse existing components and services before generating new ones.
- Preserve existing working Loop/QC capabilities while changing product presentation and routing.
- Domain separation is a customer-experience boundary, not a backend duplication boundary.
- Production changes must remain evidence-driven and must not bypass existing release gates.
