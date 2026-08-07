# Revenue Execution Queue

Purpose: keep FACTORY work focused on actions that enable revenue, user acquisition, deal closure, payment collection, or unblock production required for those outcomes.

## Priority order
1. P0 production blockers affecting customer access, deployability, auth, domain, checkout, or delivery
2. Existing revenue opportunities / active leads
3. Revenue-facing product completion
4. Payment and commercial workflow readiness
5. Sales follow-up and support
6. Growth experiments
7. Non-revenue architecture work only when it removes a verified blocker

## Current pinned execution order
- P0-1 StreamVista domain / Cloudflare reachability
- P0-2 streamvista-cloud-x build/deploy health
- P0-3 Union Auto Spares `/auth` route health
- P1 Canonical repository / deployment paths
- P1 GitHub Actions failures
- P1 Core automation workflows
- P2 Revenue-facing product release

## Completion rule
No item is marked complete until evidence is stored under `factory/audit/` with repository/ref, runtime or deployment proof where applicable, timestamp, and result.

## Parallel-work rule
Support-layer documentation, registries, evidence capture, and reusable agent/tool definitions may proceed in parallel only when they do not modify or destabilize production runtime code.
