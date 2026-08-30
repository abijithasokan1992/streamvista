# Vercel Project Consolidation Policy

## Canonical
- Project: `streamvista`
- Git repository: `abijithasokan1992/streamvista`
- Domain: `streamvista.in`
- Canonical source branch: `main`

## Classification
Other Vercel projects must be classified before they receive further product work:

1. `CANONICAL` — production product surface with a defined business purpose.
2. `FEATURE_PREVIEW` — temporary preview of canonical code.
3. `SOURCE_ASSET` — useful code/design/workflow to compose into canonical product.
4. `EXPERIMENT` — isolated research/prototype.
5. `ABANDON` — duplicate, stale, empty, or no longer economically useful.

## Rules
- Do not create a second production app merely because another Vercel project already exists.
- A project becomes a separate production application only when it has a distinct customer, domain, revenue model, data boundary, operational owner, and release gate.
- Source can be reused from any classified project, but production state must terminate in the canonical data/API contracts.
- Do not copy secrets or environment values into source control.
- Heavy media workloads are worker jobs, not long-running Vercel requests.

## Current revenue-first application grouping
### Crayons Pictures Digital Studio
Creator workspace, AI tools, project/assets, production workflow, storage and monetization.

### Crayons Bridge
Rights, buyer matching, marketplace, deal rooms, licensing, delivery.

### StreamVista Cloud Studio OS
Platform infrastructure and enterprise workspace capabilities.

These are product modules/surfaces unless and until a separate production domain and operational boundary is certified.

## Promotion gate
Before promoting any non-canonical project to production, record:
- product purpose
- primary customer
- revenue path
- API/data source
- authentication/RBAC boundary
- analytics plan
- domain
- billing/entitlements
- support/operations owner
- rollback and release evidence
