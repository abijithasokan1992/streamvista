# GitHub Governance Status

Verification timestamp: 2026-08-08 03:25 IST

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
- no pull-request workflow run was returned for that pre-change head commit
- PR #8 was opened from `chore/factory-organisation` to `main`; it remains open and unmerged

## Governance implemented by organisation PR

The branch adds:

- `.github/workflows/factory-quality-gates.yml`
- `.github/CODEOWNERS`
- master repository README and canonical map
- root ownership classification
- evidence-backed product registry
- Golden Baseline gate documentation

Required workflow gates defined by this branch:

1. Quality / Build / npm Audit
2. Semgrep
3. OSV Dependency Scan

## Enforcement status

- PR-based workflow definition: IMPLEMENTED ON ORGANISATION BRANCH
- CODEOWNERS definition: IMPLEMENTED ON ORGANISATION BRANCH
- actual workflow result: PENDING PR RUN / RECHECK AFTER SYNCHRONIZE EVENT
- `main` branch protection/ruleset: UNVERIFIED — current connector does not expose branch-protection/ruleset read/write operations
- PR-only enforcement: UNVERIFIED until branch protection/ruleset is directly confirmed
- required-check enforcement: UNVERIFIED until branch protection/ruleset requires the named checks

## Merge rule

Do not mark repository governance green and do not promote a release until:

- organisation PR workflow checks finish successfully
- branch protection/ruleset is directly verified to prevent unsafe direct promotion to `main`
- required checks are configured as merge requirements
- merged commit is independently verified

## Evidence rule

Policy text is not enforcement evidence. A branch protection/ruleset must be observed through a supported GitHub settings/API capability before this file can be changed from `UNVERIFIED` to `VERIFIED` for enforcement.
