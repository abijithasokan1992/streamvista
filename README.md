# StreamVista — Factory & Workspace Repository

This repository is the Git-backed control point for the StreamVista workspace prototype and the shared StreamVista FACTORY support layer.

> **Important:** this repository is **not** the runtime repository for every StreamVista product. Product runtimes remain in their canonical repositories. `factory/` links, classifies, governs, and records evidence without moving product runtime code into the support layer.

## Repository role

- `src/` + `public/` — current React/Vite workspace/control application prototype
- `factory/` — shared product registry, audit evidence, agents, tools, workforce, operations, revenue and knowledge
- `docs/` — repository/product documentation
- `migration/` — migration-only material; never treated as live runtime by default
- `legacy/` — retired/non-canonical material only
- `.github/` — CI, security and repository governance
- `AGENTS.md` — standing execution and safety policy

See [`docs/REPOSITORY_MAP.md`](docs/REPOSITORY_MAP.md) for ownership/classification rules.

## Canonical product map

| Product | Canonical repository state | Verified release state |
|---|---|---|
| StreamVista Website | `abijithasokan1992/streamvistacreator-com` | AMBER — build/preview evidence exists; GitHub security/regression gates pending |
| StreamVista Creator Cloud | `abijithasokan1992/streamvistacreator-com` | AMBER — shared build evidence exists; security gates pending |
| StreamVista Buyer Portal | `abijithasokan1992/streamvistacreator-com` | AMBER — shared build/preview evidence exists; security gates pending |
| StreamVista Admin Console | `abijithasokan1992/streamvistacreator-com` | AMBER — shared build/preview evidence exists; security gates pending |
| StreamVista Cloud X | `abijithasokan1992/streamvista-cloud-x` | RED — dependency lock/build evidence still gated in its release-control PR |
| StreamVista AI Chat | canonical runtime repository not yet registered | draft + prototype |
| Crayons Bridge | `abijithasokan1992/crayonsbridge-` | repository verified; runtime verification pending |
| FAST / Crayons Loop | canonical runtime repository not yet promoted; related repository exists | implementation verification pending |
| Union Auto Spares | `abijithasokan1992/union-auto-spares` | repository verified; runtime verification pending |

The authoritative record is [`factory/products/REGISTRY.md`](factory/products/REGISTRY.md). Unknown deployment, domain, database, storage, authentication or payment mappings stay explicitly `UNVERIFIED` until evidence is attached. Core 5 release evidence is recorded in [`factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`](factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md).

## FACTORY architecture

```text
factory/
├── platform/       # shared capabilities
├── products/       # canonical product records and links
├── agents/         # reusable agent specifications
├── tools/          # connectors, MCPs and utilities
├── workforce/      # orchestration and execution state
├── knowledge/      # reusable decisions and project intelligence
├── operations/     # execution queues and release controls
├── revenue/        # money-facing workflows
└── audit/          # verification evidence and incidents
```

### Implementation statuses

FACTORY uses conservative evidence-backed states:

- `live` — deployed and directly verified
- `prototype` — runnable partial implementation
- `draft` — specification/design exists but runnable implementation is not verified
- `planned` — intended but not implemented/verified

A declaration or design is never sufficient proof for `live`.

## Golden Baseline policy

`main` is the target Golden Baseline branch. Promotion to `main` requires:

1. short-lived branch
2. pull request
3. quality/build checks
4. Semgrep static analysis
5. npm dependency audit
6. OSV dependency scan
7. evidence recorded under `factory/audit/`
8. successful merge only after required checks are green
9. semantic release tag only after the merged commit is independently verified

This repository now defines the required checks in `.github/workflows/factory-quality-gates.yml`. GitHub branch-protection/ruleset enforcement must also require those checks before `main` can be treated as a fully enforced Golden Baseline.

## Evidence and source of truth

- [`factory/audit/EVIDENCE_INDEX.md`](factory/audit/EVIDENCE_INDEX.md) — evidence index
- [`factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md`](factory/audit/CORE5_RELEASE_AUDIT_2026-08-08.md) — verified Core 5 release evidence and blockers
- [`factory/audit/IMPLEMENTATION_STATUS.md`](factory/audit/IMPLEMENTATION_STATUS.md) — declared-vs-verified implementation status matrix
- [`factory/audit/GOVERNANCE_STATUS.md`](factory/audit/GOVERNANCE_STATUS.md) — GitHub governance verification
- [`factory/audit/GOLDEN_BASELINE.md`](factory/audit/GOLDEN_BASELINE.md) — release/baseline gate
- [`factory/knowledge/MASTER_INVENTORY.md`](factory/knowledge/MASTER_INVENTORY.md) — declared ecosystem inventory
- [`factory/operations/REVENUE_EXECUTION_QUEUE.md`](factory/operations/REVENUE_EXECUTION_QUEUE.md) — revenue execution queue

## Local verification

Requires a current Node.js version compatible with Vite 8.

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=high
```

Security scans are executed in GitHub Actions so their results are attached to pull requests and can be used as merge gates.

## Governance rule

**Search → Reuse → Repair → Wire → Verify → Ship.** Reuse existing runtime repositories and shared components before creating duplicates. Never claim deployment, production readiness, security clearance or `live` status without direct evidence.
