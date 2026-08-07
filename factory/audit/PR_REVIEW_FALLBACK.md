# PR Review Fallback

## Purpose

Codex and Copilot code review quotas are advisory-tool limits, not release evidence. A pull request must not depend on either AI reviewer to prove that the repository is safe to merge.

## Canonical fallback gate

`.github/workflows/pr-review-fallback.yml` provides quota-independent deterministic verification for pull requests targeting `main`.

Required checks:

1. `git diff --check`
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `npm audit --audit-level=high`

## Merge rule

- AI review available + deterministic gate green: AI findings may be considered in addition to the gate.
- AI review quota exhausted + deterministic gate green: quota exhaustion alone is not a blocker.
- Deterministic gate red or missing: do not treat the pull request as production-verified.
- A green workflow does not replace product-specific deployment, runtime-health, security, data, or owner-approval gates when those are required.

## PR #9 incident

PR #9 (`docs(factory): record Core 5 release map and blockers`) was merged after Codex and Copilot reported quota exhaustion. The quota messages did not constitute a code-quality result. This fallback exists to prevent future merge decisions from depending on unavailable AI review capacity.
