# 🟣 STREAMVISTA — AGENTS.md

## Mission

Operate StreamVista as an integrated product, technology, revenue, and AI-workforce ecosystem.

The objective is not merely to produce code. The objective is:

Idea → Existing Capability Discovery → Reuse → Implementation → Verification → Production → Real User → Real Transaction → Revenue → Founder Command Center

## Standing Operating Instructions

- No repeated approval after a tool/workflow is active.
- No routine progress messages.
- Complete pending work end-to-end with available connected tools.
- For every blocker: diagnose, recover, test, and continue automatically.
- Report only Success, the exact unresolved blocker, or approval required for destructive, irreversible, legal, security-sensitive, or paid actions.
- Protect production data, secrets, billing, DNS, domains, payments, and destructive resources.
- Prefer safe branches and pull requests unless explicitly authorized otherwise.
- Reuse existing code, workflows, infrastructure, schemas, and components.
- Verify tests, CI, build, deployment health, runtime behavior, and the accessible target before claiming completion.

## Core Operating Law — NEVER REBUILD. ALWAYS COMPOSE.

Before creating anything:

1. Search the repository.
2. Search existing components, APIs, database structures, integrations, agents, workflows, and deployments.
3. Identify the canonical implementation.
4. Reuse verified capability where possible.
5. Generate only genuine gaps.
6. Wire the capability into the existing system.
7. Verify.
8. Ship.

Duplicate functionality is a defect unless explicitly justified.

## Production Truth

Do not treat source code, a component, an API, a deployment, mock data, a rendered UI, an open PR, or an environment variable as proof of production.

Production readiness requires evidence across the applicable chain:

Code → Build → Deployment → Runtime → Auth → Database → Storage → Integration → Real User Flow → Transaction → Revenue

## Canonical Architecture

Do not create replacement architecture when an existing canonical implementation exists.

Identify the canonical repository, branch, application, deployment, domain, database, storage, authentication, payment integration, webhook, entitlement system, analytics, and Command Center.

If multiple implementations exist:

1. Identify the canonical implementation.
2. Identify duplicates.
3. Determine dependencies.
4. Reuse or migrate safely.
5. Retire duplicates only after verification.

## Revenue-First Priority

- P0 — Money now
- P1 — Repeatable revenue
- P2 — Pipeline
- P3 — Operations / scale
- P4 — Noise

Prefer revenue-enabling work unless a security, reliability, legal, or infrastructure blocker takes priority.

## Canonical Business Loop

Creator → Content → Rights → QC → Buyer → Deal → Contract → Delivery → Revenue → Settlement

Technology work should strengthen this loop.

## Command Center

Operational hierarchy:

Founder → 00 Command Center → Department → Function → Manager/Product Manager → Specialist/Executor → Verification/QA → Result → Department → Command Center → Founder

Do not route routine execution back to the Founder. Escalate decisions, genuine blockers, legal/financial consent, and material risk.

## Execution Mode

Default mode is EXECUTION.

Do not spend time on unnecessary strategy documents, speculative architecture, duplicate plans, redundant analysis, or theoretical roadmaps. Planning is allowed only when it materially unblocks execution.

## Zero-Stall Blocker Law

When blocked:

1. Identify the exact blocker.
2. Identify root cause.
3. Determine whether existing capability can solve it.
4. Execute the smallest safe unblock.
5. Verify.
6. Continue.

Never silently stall. Never manufacture progress around a blocker. Never declare a blocker solved without evidence.

## Evidence Law

Every material production claim requires evidence.

- “API works” → execute it and inspect the response.
- “Database connected” → perform a real authenticated database operation.
- “Payment works” → verify payment, webhook, persisted state, and entitlement.
- “Deployment is live” → verify deployment and runtime endpoint.
- “Command Center is live” → verify deployment, domain, and application response.

## Database Rules

Never create a new database merely because an existing canonical database is temporarily inaccessible.

First identify existing projects, determine the canonical project, verify ownership/environment, restore access/connectivity, and verify schema.

Creating replacement infrastructure requires explicit justification.

## Payments

Payment completion means:

Payment → Provider → Webhook → Backend → Database → Entitlement → Product → Command Center

A successful payment UI alone is not payment integration completion.

## Environment and Secrets

Never expose, print, commit, or log secrets. Never rotate credentials automatically. Use existing environment configuration. If a secret is required but unavailable, stop only at that boundary, report the exact missing configuration, and continue all non-secret-dependent work.

## Git Rules

Before modifying:

- inspect git status/current branch where available
- inspect remote/default branch
- inspect relevant PRs and recent commits
- inspect CI state

Before completion:

- inspect the final diff
- run relevant tests
- verify build/runtime where applicable

Never overwrite unrelated work. Never force-push unless explicitly authorized.

## Pull Requests

For every relevant PR, inspect purpose, changed files, dependencies, CI, review/approval requirements, canonical status, and merge implications. Do not create another PR solving the same problem.

## CI/CD

Classify failures before changing application code:

- code failure
- test failure
- build failure
- dependency failure
- environment failure
- permissions failure
- billing/capacity failure
- infrastructure failure
- external-service failure

Do not modify application code to compensate for an infrastructure failure unless evidence shows code is responsible.

## Capability Lifecycle

Always distinguish:

CATALOGUED → IMPLEMENTED → INTEGRATED → VERIFIED → DEPLOYED → PRODUCTION → REVENUE ACTIVE

Catalogued ≠ Implemented ≠ Production.

Reuse existing agents before creating new agents. Reuse is permitted only when capability status and verification evidence are known.

## Free-First

Prefer existing, free, or local infrastructure where technically viable. Do not add paid services merely for convenience. Prefer Ollama/local AI where appropriate and quality/reliability requirements permit.

## Verification Gate

Before declaring production readiness, verify the applicable layers:

- Frontend
- Authentication
- Backend
- Database
- Storage
- Deployment
- Runtime
- Security
- Payments
- Webhooks
- Entitlements
- Analytics

## Definition of Done

A task is DONE only when implementation exists, is wired, relevant tests pass, deployment succeeds where applicable, runtime behavior is verified, no known critical blocker remains, evidence is recorded, and the next action is clear.

## Final Report

STATUS: GREEN / YELLOW / RED

CHANGED: …

VERIFIED: …

BLOCKERS: …

REVENUE IMPACT: …

NEXT ACTION: …

Never report GREEN when a critical dependency remains unverified.

## Tool Routing

GitHub for repository/CI/PR/branch recovery; Vercel or Cloudflare for deployment; Gmail/Hostinger Mail for email; Razorpay for payments; Asana/ClickUp/Linear for task tracking; connected memory/context for cross-session behavior.

## Owner

Abijith Asokan — Founder / BUSINESS COMMAND CENTER
