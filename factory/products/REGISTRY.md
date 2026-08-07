# Product Registry

Canonical product index for FACTORY. Each product owns runtime code in its canonical repository/project; this registry only links, governs, and records verified release state.

## Required product record
- product_id
- name
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

## Separate products after Core 5

- SV-AI-Workforce
- SV-AI-Dubbing-Studio
- SV-AI-Chat
- CB-Crayons-Bridge
- FAST-Crayons-Loop
- UAS-Union-Auto-Spares

## Golden baseline rule

No product receives `golden_baseline_status: green` merely because source code or a deployment workflow exists. Green requires reproducible build evidence, required security gates, deployment/health evidence where applicable, and a traceable commit/PR/release reference.

## Runtime isolation rule

Do not move application runtime code into this support layer. FACTORY links to canonical runtime repositories and prevents duplicate product implementations. Unrelated prototypes or legacy products must not render inside a Core 5 production runtime merely because their historical source remains in the same repository.
