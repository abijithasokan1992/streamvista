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
| StreamVista Website | `abijithasokan1992/streamvistacreator-com` | Runtime/routes exist; not yet independently production-green | PR #102 isolates non-Core-5 College ERP runtime and adds boundary test | GitHub Actions approval/execution required before build/regression/security evidence can be trusted |
| Creator Cloud | `abijithasokan1992/streamvistacreator-com` | Creator V2 routes/modules exist; not yet independently production-green | PR #102 protects canonical creator entry surface; PR #101 contains security remediation | PR #101 and #102 must remain unmerged until Actions run and security/build/regression evidence is green |
| Buyer Portal | `abijithasokan1992/streamvistacreator-com` | Buyer dashboard/marketplace modules exist; not yet independently production-green | PR #102 protects canonical buyer entry surface; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| Admin Console | `abijithasokan1992/streamvistacreator-com` | Canonical `/admin/*` route source exists; not yet independently production-green | PR #102 documents shared logical boundary; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| StreamVista Cloud X | `abijithasokan1992/streamvista-cloud-x` | Separate frontend/backend runtime exists; lockfile reproducibility not verified | Draft PR #57 adds isolated lockfile regeneration + `npm ci` + build + high/critical audit gate | `frontend/package.json` declares `@supabase/supabase-js` while current lockfile root dependency set does not; GitHub runner execution/evidence still required |

## Active release-control PRs

- `streamvistacreator-com#101` — security remediation. **Must remain open and unmerged** until Semgrep, npm audit, OSV, regression and build evidence are independently green.
- `streamvistacreator-com#102` — Core 5 runtime-boundary cleanup. Draft/unmerged until build/regression/security checks are green.
- `streamvista-cloud-x#57` — frontend lock/build repair. Draft/unmerged until synchronized lockfile plus `npm ci`, build and audit evidence are green.

## Canonical product records

### SV-Website — StreamVista Website
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: public product/company entry surface
- implementation_status: runtime/routes verified in source; production-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: shared-runtime build/regression/security gates pending
- next_revenue_action: verify production-safe public entry surface after release gates are green

### SV-Creator-Cloud — StreamVista Creator Cloud
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: creator onboarding and content workflow
- implementation_status: Creator V2 routes/modules exist; production-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: PR #101 and #102 build/regression/security evidence pending
- next_revenue_action: verify creator submission path and canonical deployment mapping after gates pass

### SV-Buyer-Portal — StreamVista Buyer Portal
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: buyer access and licensing marketplace
- implementation_status: buyer dashboard/marketplace modules exist; production-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: shared-runtime PR #101/#102 security/build/regression gates pending
- next_revenue_action: verify buyer licensing path and deployment after shared-runtime gates pass

### SV-Admin — StreamVista Admin Console
- business_owner: Abijith Asokan
- repository: `abijithasokan1992/streamvistacreator-com`
- canonical_branch: `main`
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: operational control for licensing and creator/buyer workflows
- implementation_status: canonical `/admin/*` route source exists; production-green verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: shared-runtime PR #101/#102 security/build/regression gates pending
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
- implementation_status: separate frontend/backend runtime exists; reproducible build verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/incidents/P0-2-streamvista-cloud-x-lockfile.md`
- current_blockers: manifest/lockfile drift recorded; PR #57 runner evidence pending
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
