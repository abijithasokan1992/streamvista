# PR Review Fallback

## Purpose

Codex and Copilot code review quotas are advisory-tool limits, not release evidence. A pull request must not depend on either AI reviewer to prove that the repository is safe to merge.

## Canonical fallback gate

`.github/workflows/pr-review-fallback.yml` provides quota-independent deterministic verification for pull requests targeting `main`.

Required checks:

1. `git diff --check`
2. exact reviewed dependency-lock blob verification
3. `npm ci`
4. `npm run lint`
5. `npm run build`
6. `npm audit --audit-level=high`

## Merge rule

- AI review available + deterministic gate green: AI findings may be considered in addition to the gate.
- AI review quota exhausted + deterministic gate green: quota exhaustion alone is not a blocker.
- Deterministic gate red or missing: do not treat the pull request as production-verified.
- A green workflow does not replace product-specific deployment, runtime-health, security, data, or owner-approval gates when those are required.

## PR #11 dependency-lock recovery

PR #11 originally proved its dependency-security recovery by temporarily substituting the exact reviewed lockfile from PR #8 during CI. That stacked proof was intentionally held from merge because PR #11 itself did not yet contain the remediated lockfile.

The recovery was then promoted to a self-contained state:

- canonical PR #8 head: `73f4d4fef909242e49576133a8a321e8f4e22683`
- shared `package.json` blob: `a743ed1012accc0c8cafb3b49893cc61d53bccf8`
- adopted reviewed `package-lock.json` blob: `b74ea283fdffd4c8d4a6d329ceffc9e09611228e`
- the one-time adoption workflow verified the exact source head/blob, ran clean install, lint, build, and npm audit, committed only the adopted lockfile, and removed itself
- the permanent fallback gate now verifies the local `package-lock.json` blob directly; it no longer substitutes a lockfile during CI

A final green fallback run on the current PR #11 head is required before this recovery can be counted verified resolved.

## PR #9 incident

PR #9 (`docs(factory): record Core 5 release map and blockers`) was merged after Codex and Copilot reported quota exhaustion. The quota messages did not constitute a code-quality result. This fallback exists to prevent future merge decisions from depending on unavailable AI review capacity.
