# StreamVista Final Ecosystem Architecture

**Status: APPROVED**

## Parent Company

**STREAMVISTA (OPC) PRIVATE LIMITED** is the parent company and owns the StreamVista ecosystem.

## Product Architecture

```text
                    STREAMVISTA
                         |
             +-----------+-----------+
             |           |           |
          CREATION    MARKETPLACE  DISTRIBUTION
             |           |           |
       CRAYONS        CRAYONS      CRAYONS
       PICTURES       BRIDGE       LOOP
             |           |           |
             +-----------+-----------+
                         |
                  SHARED PLATFORM
          Auth | Users | Rights | Payments
          Storage | Analytics | RBAC | AI
```

## Public Products

### STREAMVISTA
- Primary ecosystem/company platform
- Canonical domain: `streamvista.in`
- Entry point for identity, product discovery, creator onboarding and shared platform services.

### CRAYONS PICTURES
- AI film-making and production
- Feature films, series, web series and documentaries
- Script -> production -> post-production
- Director / Creator Workspace
- Production services and AI filmmaking workflows
- Finished projects can continue into Crayons Bridge and/or Crayons LOOP.

### CRAYONS BRIDGE
- Content rights and licensing marketplace
- Film rights, OTT licensing and rights verification
- Buyer access and controlled Deal Room
- Commercial negotiation and licensing workflows
- Razorpay revenue path
- Primary commercial/revenue engine for the ecosystem.

### CRAYONS LOOP
- OTT / distribution network
- Movies, series, reels and cartoons
- Documentary series
- LOOP Moments
- LOOP Live
- LOOP Live Moments
- FAST/OTT/channel programming, delivery and monetization workflows
- Canonical public domain: `crayonsloop.com`
- Secondary domain: `crayonsloop.in`, redirecting to the canonical `.com` surface.

### CRAYONS CREATOR CLOUD
- Creator/media cloud
- Storage, ingest, QC, project assets and delivery

### STREAMVISTA CLOUD X
- Media technology and infrastructure layer
- Reusable cloud, media-processing and operational capabilities

### STREAMVISTA AI COMMAND CENTER
- Private internal control plane
- Founder, admin, AI and operations
- Not a public-facing product
- Controls and observes the ecosystem through shared services and RBAC.

## Shared Platform Contract

All public products reuse one shared technology boundary:

- Authentication and Supabase session management
- Users and organizations
- RBAC and product entitlements
- Billing and Razorpay
- Payment and entitlement persistence
- Storage and media assets
- AI services
- Media processing and QC
- Email/notifications
- APIs and serverless functions
- Analytics and revenue telemetry
- Audit/security controls

A customer should have **one StreamVista identity**, not separate accounts for Pictures, Bridge, LOOP or Creator Cloud.

```text
Brand/domain
    -> StreamVista Identity
    -> Organization
    -> Entitlements + RBAC
    -> Product Workspace
```

## Revenue Architecture

The first production revenue gate is the verified StreamVista plan checkout:

```text
Customer
  -> Sign up / Login
  -> Plans
  -> Server-side price rule
  -> Razorpay order
  -> Real payment
  -> Signature + provider verification
  -> Supabase payment ledger
  -> Plan entitlement ACTIVE
  -> Creator Workspace
```

The marketplace revenue path follows the same shared billing boundary:

```text
Creator / Rights Owner
  -> Verified Title
  -> Crayons Bridge Listing
  -> Buyer Access
  -> Deal Room
  -> Razorpay
  -> Verified Payment
  -> Persisted Entitlement / Deal State
  -> Revenue Visibility
```

No UI state may claim a plan, entitlement or revenue event is successful unless the server-side verification and persistence gates succeed.

## Domain Strategy

Currently confirmed public domains:

- `streamvista.in`
- `crayonsloop.com`
- `crayonsloop.in`

Do not invent or attach unverified domains. Future Pictures/Bridge domains are added only after domain ownership/DNS/Vercel mapping is independently verified.

## Engineering Rules

1. One parent company, one shared platform boundary.
2. Separate customer-facing products by route, domain, navigation, RBAC and analytics namespace.
3. Do not duplicate authentication, billing, payment, storage, analytics or core APIs.
4. Reuse existing working code before generating new implementations.
5. Preserve existing media/QC/LOOP capabilities while separating product presentation.
6. Crayons Bridge remains the primary commercial/revenue path until the release gate is green.
7. Production promotion requires evidence: CI -> authenticated browser flow -> API -> Supabase/RLS -> real payment -> persisted revenue -> live verification.
8. No fake payments, fake revenue, fabricated catalog records or client-only entitlement unlocks.
9. Vercel build/deployment limits are infrastructure gates and must not be mistaken for application correctness.
10. The Command Center remains private and is the operational control plane, not a public product.

## Release Principle

**Never rebuild the ecosystem from zero. Audit -> reuse -> compose -> patch -> test -> verify -> release -> verify live -> measure revenue.**
