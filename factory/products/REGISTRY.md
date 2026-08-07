# Product Registry

Canonical product index for FACTORY. Runtime code remains in each product's canonical repository. Unknown mappings are explicitly `UNVERIFIED` and must not be guessed.

## Product records

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
- implementation_status: prototype / partial
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/incidents/P0-2-streamvista-cloud-x-lockfile.md`
- current_blockers: recorded manifest/lockfile drift; production build not independently verified
- next_revenue_action: clear dependency/build gate, then verify deployable baseline

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
- implementation_status: working design; runtime verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: component/runtime verification pending
- next_revenue_action: verify creator submission path and canonical deployment mapping

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

### SV-Buyer-Portal — StreamVista Buyer Portal
- business_owner: Abijith Asokan
- repository: UNREGISTERED
- canonical_branch: UNVERIFIED
- deployment: UNVERIFIED
- domain: UNVERIFIED
- database: UNVERIFIED
- storage: UNVERIFIED
- auth: UNVERIFIED
- payment: UNVERIFIED
- revenue_model: buyer access and licensing marketplace
- implementation_status: verification pending
- golden_baseline_status: NOT VERIFIED
- evidence_path: `factory/audit/IMPLEMENTATION_STATUS.md`
- current_blockers: dedicated canonical runtime repository not registered
- next_revenue_action: verify existing Buyer Portal implementation and revenue path

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

## Registration rules

1. Repository existence does not prove deployment or production readiness.
2. A product may have exactly one canonical runtime repository at a time.
3. Related, historical, generated or experimental repositories are not canonical unless explicitly verified and promoted.
4. `UNVERIFIED` remains until direct evidence is recorded.
5. Runtime code stays outside this support registry.
6. Promotion to `live` requires repository/ref, verification result, deployment evidence and timestamp.
7. Reuse → Repair → Extend → Create last.
