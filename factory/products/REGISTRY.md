# Product Registry

Canonical product index for FACTORY. Each product owns runtime code in its canonical repository/project; this registry only links, governs, and records verified release state. Unknown infrastructure mappings are explicitly `UNVERIFIED` and must not be guessed.

## Required product record

Each canonical record tracks:
- product_id
- business_owner
- repository
- canonical_branch
- deployment
- domain
- database
- storage
- auth
- payment
- revenue_model
- implementation_status
- golden_baseline_status
- evidence_path
- current_blockers
- next_revenue_action

## Core 5 release map

| Product | Canonical runtime | Current verified state | Active release work | Release blocker |
|---|---|---|---|---|
| StreamVista Website | `abijithasokan1992/streamvistacreator-com` | **AMBER** — PR #102 Vercel production build/preview is READY; current production baseline has no Vercel runtime error clusters in the observed 24h window | PR #102 isolates non-Core-5 College ERP runtime, adds boundary test/docs | Required GitHub regression/security Actions have not produced green evidence |
| Creator Cloud | `abijithasokan1992/streamvistacreator-com` | **AMBER** — PR #102 shared production build succeeds and creator chunks are emitted; not security-green | PR #102 protects canonical creator surface; PR #101 contains security remediation | PR #101/#102 Actions approval/execution; Semgrep/npm audit/OSV/regression evidence pending |
| Buyer Portal | `abijithasokan1992/streamvistacreator-com` | **AMBER** — PR #102 shared production build/preview is READY; not security-green | PR #102 protects canonical buyer entry surface; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| Admin Console | `abijithasokan1992/streamvistacreator-com` | **AMBER** — PR #102 shared production build/preview is READY; not security-green | PR #102 documents shared logical boundary; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| StreamVista Cloud X | `abijithasokan1992/streamvista-cloud-x` | **RED** — separate frontend/backend runtime exists, but `package.json`/lockfile are not synchronized | Draft PR #57 adds lock regeneration, deterministic consistency check, `npm ci`, build and high/critical audit gate | GitHub runner has not produced synchronized lock/build/audit evidence |

Detailed evidence: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`

## Active release-control PRs

- `streamvistacreator-com#101` — security remediation. **Must remain open and unmerged** until Semgrep, npm audit, OSV, regression and build evidence are independently green. Current GitHub workflow conclusions are `action_required`; connector retry returned HTTP 403. Final-head Vercel preview is additionally rate-limit blocked.
- `streamvistacreator-com#102` — Core 5 runtime-boundary cleanup. Vercel preview/build is verified READY, but PR remains draft/unmerged until required GitHub regression/security checks are green.
- `streamvista-cloud-x#57` — frontend lock/build repair. Draft/unmerged until synchronized lockfile plus deterministic consistency check, `npm ci`, build and audit evidence are green.

## Canonical product records

### SV-Website — StreamVista Website
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: Vercel production baseline observed READY; exact product mapping remains evidence-controlled
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: public product/company entry surface
- implementation_status: AMBER — PR #102 production build/preview READY; security/regression gates pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`
- current_blockers: required GitHub regression/security Actions have not produced green evidence
- next_revenue_action: preserve current production baseline; promote cleanup only after required checks pass

### SV-Creator-Cloud — StreamVista Creator Cloud
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: shared Vercel production baseline observed READY; exact product mapping remains evidence-controlled
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: creator onboarding and content workflow
- implementation_status: AMBER — PR #102 shared production build succeeds; security-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`
- current_blockers: PR #101/#102 Actions approval/execution; Semgrep/npm audit/OSV/regression evidence pending
- next_revenue_action: verify creator submission path and promote only after shared-runtime gates pass

### SV-Buyer-Portal — StreamVista Buyer Portal
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: shared Vercel preview/build evidence READY; exact production mapping remains evidence-controlled
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: buyer access and licensing marketplace
- implementation_status: AMBER — shared production build/preview READY; security-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`
- current_blockers: shared-runtime GitHub security/regression gates pending
- next_revenue_action: verify buyer licensing path and promote after shared-runtime gates pass

### SV-Admin — StreamVista Admin Console
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: shared Vercel preview/build evidence READY; exact production mapping remains evidence-controlled
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: operational control for licensing and creator/buyer workflows
- implementation_status: AMBER — canonical `/admin/*` source exists and shared preview/build is READY; security-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`
- current_blockers: shared-runtime GitHub security/regression gates pending
- next_revenue_action: verify admin-controlled licensing workflow after shared-runtime gates pass

### SV-Cloud-X — StreamVista Cloud X
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvista-cloud-x`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: platform and content-licensing operations
- implementation_status: RED — separate frontend/backend runtime exists; package/lock synchronization and reproducible build evidence pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`
- current_blockers: PR #57 runner has not produced synchronized lock/build/audit evidence
- next_revenue_action: clear dependency/build gate, then verify deployable baseline

## Separate products after Core 5

### SV-AI-Workforce — StreamVista AI Workforce
- business_owner: Abijith Asokan
- repository: UNREGISTERED
- canonical_branch: UNVERIFIED
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: AI workforce/orchestration
- implementation_status: verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: canonical runtime repository not registered
- next_revenue_action: identify and reuse existing implementation before creating anything new

### SV-AI-Dubbing-Studio — StreamVista AI Dubbing Studio
- business_owner: Abijith Asokan
- repository: UNREGISTERED
- canonical_branch: UNVERIFIED
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: AI dubbing/localization services
- implementation_status: verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: canonical runtime repository not registered
- next_revenue_action: identify and verify existing implementation before promotion

### SV-AI-Chat — StreamVista AI Chat
- business_owner: Abijith Asokan
- repository: UNREGISTERED
- canonical_branch: UNVERIFIED
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: AI workspace/service
- implementation_status: draft + prototype
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: canonical runtime repository not registered
- next_revenue_action: identify and reuse existing implementation before creating anything new

### CB-Crayons-Bridge — Crayons Bridge
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/crayonsbridge-`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: B2B content licensing
- implementation_status: repository verified; runtime verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: deployment/infrastructure/runtime evidence not registered
- next_revenue_action: verify licensable catalogue workflow and buyer-facing deployment

### FAST-Crayons-Loop — FAST / Crayons Loop
- business_owner: Abijith Asokan
- repository: UNREGISTERED; `abijithasokan1992/crayons-loop-Moments-` exists but is not promoted as canonical
- canonical_branch: UNVERIFIED
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: FAST / AVOD monetization
- implementation_status: verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: canonical runtime repository not confirmed
- next_revenue_action: verify FAST runtime, channel workflow and canonical repository

### UAS-Union-Auto-Spares — Union Auto Spares
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/union-auto-spares`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: retail ERP and online sales
- implementation_status: repository verified; runtime verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: deployment/data-migration/runtime evidence not registered
- next_revenue_action: verify working MVP baseline before migration/promotion

## Golden baseline rule

No product receives `golden_baseline_status: green` merely because source code or a deployment workflow exists. Green requires reproducible build evidence, required security gates, deployment/health evidence where applicable, and a traceable commit/PR/release reference.

## Runtime isolation rule

Do not move application runtime code into this support layer. FACTORY links to canonical runtime repositories and prevents duplicate product implementations. Unrelated prototypes or legacy products must not render inside a Core 5 production runtime merely because their historical source remains in the same repository.

## Registration rules

1. Repository existence does not prove deployment or production readiness.
2. A product may have exactly one canonical runtime repository at a time; multiple logical products may intentionally share one verified runtime repository when that architecture is explicitly recorded.
3. Related, historical, generated or experimental repositories are not canonical unless explicitly verified and promoted.
4. `UNVERIFIED` remains until direct evidence is recorded.
5. Runtime code stays outside this support registry.
6. Promotion to `live` requires repository/ref, verification result, deployment evidence and timestamp.
7. Reuse → Repair → Extend → Create last.
