# Golden Baseline Release Gate

Repository: `abijithasokan1992/streamvista`
Target branch: `main`
Candidate semantic release: `v0.1.0`

## Current baseline state

The verified pre-organisation `main` head is:

`18e7a006cdccf3009e0fb83c3c8dc14bf2695aa9`

This commit is a **baseline input**, not a verified semantic release. No release/tag is promoted by this document.

## Release gate

A commit may become the Golden Baseline only when all conditions are evidenced:

- pull request used for promotion
- lint passes
- production build passes
- npm audit gate passes
- Semgrep passes
- OSV dependency scan passes
- no unresolved release-blocking incident applies to this repository
- branch protection/ruleset enforcement is directly verified
- merged `main` commit is re-checked after merge
- semantic tag points to that exact verified `main` commit

## Candidate release sequence

1. Complete organisation PR on `chore/factory-organisation`.
2. Verify all CI/security checks.
3. Verify GitHub ruleset/branch-protection enforcement.
4. Merge only after all required gates are green.
5. Re-verify the merged `main` commit.
6. Create semantic tag `v0.1.0` on that exact commit.
7. Record tag, commit, checks and timestamp in the evidence index.

## Current status

- candidate: `v0.1.0`
- tag_created: NO
- release_created: NO
- golden_baseline_verified: NO
- reason: organisation PR and governance enforcement are not yet fully verified

## Tool capability note

The currently connected GitHub actions available in this session support repository files, branches, PRs and CI inspection but do not expose semantic tag/release creation or branch-protection/ruleset configuration. Those actions must not be claimed as completed without a supported capability and direct verification.
