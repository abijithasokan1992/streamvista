# GitHub Governance Status

Verification started: 2026-08-08 03:25 IST

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
- the pre-change `main` head verified for this organisation pass was `18e7a006cdccf3009e0fb83c3c8dc14bf2695aa9`
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

## Verification status

- PR-based workflow definition: IMPLEMENTED ON ORGANISATION BRANCH
- CODEOWNERS definition: IMPLEMENTED ON ORGANISATION BRANCH
- evidence-driven PR template: IMPLEMENTED ON ORGANISATION BRANCH
- PR mergeability: VERIFIED (`mergeable=true`)
- workflow result: NOT VERIFIED — the connected GitHub workflow lookup returned no pull-request-triggered workflow run for the observed PR head/merge SHAs after open/synchronize events
- `main` branch protection/ruleset: UNVERIFIED — current connector does not expose branch-protection/ruleset read/write operations
- PR-only enforcement: UNVERIFIED until branch protection/ruleset is directly confirmed
- required-check enforcement: UNVERIFIED until branch protection/ruleset requires the named checks

## Merge rule

PR #8 must remain open and unmerged until:

- Quality / Build / npm Audit is verified green
- Semgrep is verified green
- OSV Dependency Scan is verified green
- branch protection/ruleset is directly verified to prevent unsafe direct promotion to `main`
- required checks are configured as merge requirements

After merge, the exact merged `main` commit must be independently verified before semantic tagging.

## Evidence rule

Policy text, workflow YAML or repository-name similarity is not enforcement/runtime evidence. A workflow result and branch protection/ruleset must be directly observed through a supported capability before governance can be marked `VERIFIED`.
