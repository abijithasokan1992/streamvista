# Repository Map and Ownership Classification

This document classifies the root repository so runtime, support, migration, legacy and documentation material cannot be confused.

## Root ownership map

| Path | Class | Owner / purpose | Production rule |
|---|---|---|---|
| `.github/` | governance | CI, security, PR/repository controls | may define gates; never application runtime |
| `src/` | runtime-prototype | current StreamVista React/Vite workspace/control application | treat as prototype until deployment/runtime evidence exists |
| `public/` | runtime-assets | static assets for the current application | follows `src/` release state |
| `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules` | runtime-configuration | Firebase configuration for current application lineage | configuration presence is not proof of production mapping |
| `package.json`, `package-lock.json`, TypeScript/Vite configs | runtime-build | build/dependency definition for current application | must pass quality/security gates before promotion |
| `factory/` | support/control | shared FACTORY registry, agents, tools, workforce, audit, revenue, knowledge and operations | must not absorb product runtime implementations |
| `docs/` | documentation | repository/product documentation | non-runtime |
| `migration/` | migration | temporary mappings and migration-only material | never source of truth after migration completes |
| `legacy/` | legacy | retired/non-canonical material | no live runtime may depend on it without an explicit recovery decision |
| `AGENTS.md` | governance | standing execution/safety policy | repository-wide policy |
| `README.md` | master entry point | human-readable source-of-truth map | must link canonical registries/evidence |

## Current runtime identity

The code under `src/` is a StreamVista workspace/control application prototype with authenticated routes for dashboards, titles, creator/buyer views, uploads, screenings, QC, legal, finance, analytics, campaigns, users and settings. This repository must not be treated as the canonical runtime for every product listed by FACTORY.

## Canonicality rules

1. Every product has one canonical runtime repository.
2. FACTORY records links and evidence; it does not duplicate runtime code.
3. Migration material is temporary and cannot silently become canonical.
4. Legacy material is quarantined from active runtime.
5. A deployment, database, domain or integration is not canonical until its mapping is directly verified and recorded.
6. When duplicate implementations are found: Reuse → Repair → Extend → Create last.

## Change placement rule

Before adding a file, classify the change:

- application behavior → product runtime repository
- cross-product registry/orchestration/evidence → `factory/`
- documentation → `docs/`
- migration-only transformation/mapping → `migration/`
- retired material kept only for recovery/history → `legacy/`
- CI/security/repository control → `.github/`

If the correct ownership is unclear, do not create a parallel implementation. Record the ambiguity in FACTORY audit/registry first.
