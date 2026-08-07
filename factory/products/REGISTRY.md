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
| StreamVista Website | `abijithasokan1992/streamvistacreator-com` | Runtime/routes exist; not yet independently production-green | PR #102 isolates non-Core-5 College ERP runtime and adds boundary test | GitHub Actions approval/execution required before build/regression/security evidence can be trusted |
| Creator Cloud | `abijithasokan1992/streamvistacreator-com` | Creator V2 routes/modules exist; not yet independently production-green | PR #102 protects canonical creator entry surface; PR #101 contains security remediation | PR #101 and #102 must remain unmerged until Actions run and security/build/regression evidence is green |
| Buyer Portal | `abijithasokan1992/streamvistacreator-com` | Buyer dashboard/marketplace modules exist; not yet independently production-green | PR #102 protects canonical buyer entry surface; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| Admin Console | `abijithasokan1992/streamvistacreator-com` | Canonical `/admin/*` route source exists; not yet independently production-green | PR #102 documents shared logical boundary; PR #101 contains security remediation | Same shared-runtime Actions/security gate |
| StreamVista Cloud X | `abijithasokan1992/streamvista-cloud-x` | Separate frontend/backend runtime exists; lockfile reproducibility not verified | Draft PR #57 adds isolated lockfile regeneration + `npm ci` + build + high/critical audit gate | `frontend/package.json` declares `@supabase/supabase-js` while current lockfile root dependency set does not; GitHub runner execution/evidence still required |

## Active release-control PRs

- `streamvistacreator-com#101` — security remediation. **Must remain open and unmerged** until Semgrep, npm audit, OSV, regression and build evidence are independently green.
- `streamvistacreator-com#102` — Core 5 runtime-boundary cleanup. Draft/unmerged until build/regression/security checks are green.
- `streamvista-cloud-x#57` — frontend lock/build repair. Draft/unmerged until synchronized lockfile plus `npm ci`, build and audit evidence are green.

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
