# Core 5 Release Audit — 2026-08-08

Scope: StreamVista Website, Creator Cloud, Buyer Portal, Admin Console, and StreamVista Cloud X.

This record contains only evidence observed through GitHub/Vercel during the production-safe cleanup session. No production database, storage, auth, payment, DNS, or destructive mutation was performed.

## Shared runtime — Website / Creator / Buyer / Admin

Canonical repository: `abijithasokan1992/streamvistacreator-com`

### Current production baseline

- `main` baseline commit observed: `8d40654e227a15118cfe895d9b249f99ae311bda`.
- Existing Vercel production deployment for that commit is `READY`.
- Vercel runtime error-cluster query for the most recent 24-hour window returned no runtime errors.

### Core 5 boundary cleanup

Draft PR: https://github.com/abijithasokan1992/streamvistacreator-com/pull/102

Branch: `fix/core5-runtime-boundary`

Verified changes:

- Historical College ERP implementation was removed from the active StreamVista runtime surface and replaced with a backward-compatible `/college-erp` redirect to `/`.
- Added `src/test/smoke/core5-runtime-boundary.test.ts` to guard canonical Website, Creator, Buyer, and Admin entry surfaces and prevent the College ERP demo from returning to the StreamVista runtime.
- Added `docs/core5-runtime-boundary.md` defining logical product boundaries and release gates.

Preview/build evidence:

- Vercel deployment `dpl_69BCmzuiz6vkhboQgUKUgnopNdy7` for commit `9cfe12fdfcde58a3476864476b5732120cf3552f` is `READY`.
- Build used Node 22 and executed `npm run build` -> `vite build` successfully.
- Vite transformed 2233 modules and completed the production build successfully in 13.19s.
- Deployment completed successfully.
- Build emitted non-fatal chunk-size/dynamic-import warnings; these are optimization items, not build failures.
- Preview `/college-erp` returns the healthy StreamVista SPA shell with HTTP 200; source-level redirect remains the authoritative client-routing evidence.

Release state: **NOT GREEN / DO NOT MERGE YET** because GitHub regression/security Actions have not produced green evidence for this PR.

### Security remediation

PR: https://github.com/abijithasokan1992/streamvistacreator-com/pull/101

Head observed: `7a89b8d202c302aac5cb315eea1b40d370e80af7`

Verified state:

- Security Dependency Remediation, Security Scans, CodeQL, Regression, Accessibility, and robots-policy workflow runs are all recorded as `action_required` rather than pass/fail.
- Security Dependency Remediation exposed no jobs in the observed run.
- Attempting to re-run the Security Scans run through the connected GitHub action returned HTTP 403: the run cannot be retried.
- Therefore this is classified as a GitHub Actions approval/execution-policy blocker, not as a verified scanner failure or pass.
- Vercel status on the final head is blocked by the Vercel build-rate limit; a previous PR #101 commit (`42cbe93a3049428361494204d63349f6dd78ce54`) has a `READY` preview, but the final head is two commits ahead and includes package/package-lock changes, so that older preview is not sufficient final-head build evidence.

Release rule: **PR #101 remains open and unmerged until Semgrep, npm audit, OSV, regression/build, and required security evidence are independently green.**

## StreamVista Cloud X

Canonical repository: `abijithasokan1992/streamvista-cloud-x`

Draft repair PR: https://github.com/abijithasokan1992/streamvista-cloud-x/pull/57

Branch: `fix/frontend-lock-build`

### Verified blocker

- `frontend/package.json` declares `@supabase/supabase-js` `^2.55.0`.
- `frontend/package-lock.json` root dependency record does not contain `@supabase/supabase-js` and contains only React/ReactDOM in runtime dependencies.
- The mismatch also exists in historical commits inspected, including the commit labelled as a prior lock-drift recovery; therefore reusing an old lock blob is not safe.
- Supabase is actively imported by the Cloud X frontend and is used by System Sync, Communication Center, Agent Control Room and related runtime modules; removing the SDK solely to make the lockfile pass would be a feature regression and is rejected.

### Repair work completed on PR #57

- Added an isolated GitHub workflow that regenerates the lockfile from `package.json` on the repair branch.
- Added deterministic `frontend/scripts/verify-lock-consistency.mjs` to fail when package and lock root dependencies/specs diverge.
- Repair workflow sequence is: regenerate lock -> verify lock consistency -> `npm ci` -> production build -> `npm audit --audit-level=high` -> commit regenerated lock back to the repair branch when changed.
- Production `main` remains untouched.

### Remaining Cloud X blocker

The branch lockfile is still unchanged and no status checks are currently reported on the repair head. The GitHub runner must execute the repair workflow and produce the synchronized lockfile plus install/build/audit evidence before PR #57 can be considered mergeable for release purposes.

Release state: **NOT GREEN / DO NOT MERGE YET**.

## Core 5 decision table

| Product | Build evidence | Runtime/preview evidence | Security evidence | Release state |
|---|---|---|---|---|
| StreamVista Website | PR #102 Vercel production build succeeds | Preview healthy; current production baseline reports no Vercel runtime errors in last 24h | Shared GitHub security gate pending | AMBER |
| Creator Cloud | PR #102 shared build succeeds and creator chunks are emitted | Shared preview READY | Shared GitHub security gate pending | AMBER |
| Buyer Portal | PR #102 shared build succeeds | Shared preview READY | Shared GitHub security gate pending | AMBER |
| Admin Console | PR #102 shared build succeeds | Shared preview READY | Shared GitHub security gate pending | AMBER |
| Cloud X | Not yet reproducible because lock is inconsistent | Existing runtime/deploy code exists; repair branch not verified | Audit gate prepared but not executed | RED |

## Genuine owner/platform blockers

1. GitHub Actions approval/execution is required for `streamvistacreator-com` PR #101/#102 so required workflows can actually run and produce evidence.
2. Cloud X repair workflow must be allowed to execute on PR #57 / `fix/frontend-lock-build`; the synchronized lockfile and build/audit result must then be reviewed.
3. Vercel final-head preview for PR #101 is currently rate-limit blocked. No paid-plan upgrade is required for the release decision if GitHub CI independently provides the required build/security evidence.

## Non-negotiable merge rule

Do not merge PR #101, PR #102, or PR #57 and do not mark any Core 5 product production-clean until its stated gates are evidenced green. Preserve the current production baseline until then.
