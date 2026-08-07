# GitHub Governance Status

Verification date: 2026-08-08 IST

Repository: `abijithasokan1992/streamvista`
Default branch: `main`
Organisation PR: `#8`
Organisation branch: `chore/factory-organisation`

## Verified repository metadata

- repository is accessible and active
- default branch is `main`
- repository owner/admin access is available to `abijithasokan1992`
- merge commits, squash merges and rebase merges are enabled in repository metadata
- auto-merge is not enabled in the verified repository metadata
- update-branch support is not enabled in the verified repository metadata
- PR #8 has been synchronized with the observed `main` head `6ff777d7b25b8039646aa20ea802d4d353b7ed8e`
- PR #8 is open, mergeable and unmerged

## Governance implemented by organisation PR

The branch adds:

- `.github/workflows/factory-quality-gates.yml`
- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- master repository README and canonical map
- root ownership classification
- evidence-backed product registry
- Golden Baseline gate documentation

Required workflow gates defined by this branch:

1. Quality / Build / npm Audit
2. Semgrep
3. OSV Dependency Scan

GitHub Action references used directly by the quality workflow are pinned to immutable commit SHAs to avoid mutable-tag supply-chain risk.

## Verified CI evidence

Factory Quality Gates run `#12` (`31223418402`) executed against PR #8 after dependency and workflow hardening.

Observed results:

- Quality / Build / npm Audit: **GREEN**
  - `npm ci`: success
  - lint: success (warnings only, zero lint errors)
  - production build: success
  - `npm audit --audit-level=high`: success / zero reported vulnerabilities
- Semgrep: **GREEN**
  - prior mutable-action-tag findings were remediated by immutable SHA pinning
  - final Semgrep scan completed successfully
- OSV Dependency Scan: **GREEN**
  - scanner completed successfully
  - code-scanning upload completed successfully

Dependency lock remediation was limited to `package-lock.json`; product runtime source under `src/` was not modified by the organisation/security repair work.

Any commit made after this recorded run, including evidence-only changes, must receive the same gates before merge.

## Enforcement status

- PR-based workflow definition: IMPLEMENTED
- CODEOWNERS definition: IMPLEMENTED
- evidence-driven PR template: IMPLEMENTED
- PR mergeability: VERIFIED
- workflow execution: VERIFIED
- Quality / Build / npm Audit: VERIFIED GREEN on run #12
- Semgrep: VERIFIED GREEN on run #12
- OSV Dependency Scan: VERIFIED GREEN on run #12
- `main` branch protection/ruleset: **UNVERIFIED** — the connected GitHub capability does not expose branch-protection/ruleset read/write operations
- PR-only enforcement: **UNVERIFIED** until branch protection/ruleset is directly confirmed
- required-check enforcement: **UNVERIFIED** until branch protection/ruleset requires the named checks

## Merge rule

PR #8 must remain open and unmerged until:

- the latest PR head is verified green by all three quality/security jobs
- branch protection/ruleset is directly verified to prevent unsafe direct promotion to `main`
- required checks are configured as merge requirements

After merge, the exact merged `main` commit must be independently re-checked before semantic tagging.

## Evidence rule

Policy text, workflow YAML or repository-name similarity is not enforcement/runtime evidence. Workflow results and branch protection/ruleset enforcement are separate evidence classes; both must be directly verified before governance can be marked fully `VERIFIED`.
