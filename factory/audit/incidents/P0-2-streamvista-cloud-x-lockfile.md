# P0-2 — streamvista-cloud-x lockfile drift

Status: **BLOCKED — dependency drift verified; GitHub Actions execution path failing before steps start**
Priority: P0
Revenue impact: blocks reliable deployability and release promotion of StreamVista Cloud X

## Component / source

- Product: StreamVista Cloud X
- Repository: `abijithasokan1992/streamvista-cloud-x`
- Canonical branch: `main`
- Verified `main` baseline for this repair: `e4afd1bc919c732dfcb7536aafab14febdd1220c`
- Repair PRs observed: #57 `fix/frontend-lock-build` and #58 `fix/frontend-lockfile-drift`
- Latest verified evidence commit on PR #58: `8d4913f18f0f9f775c3da3bc00fbae5a105cf3dc`

## Verified dependency drift

`frontend/package.json` declares:

- `@supabase/supabase-js`: `^2.55.0`
- `react`: `19.1.1`
- `react-dom`: `19.1.1`

The root dependency record in `frontend/package-lock.json` currently contains only:

- `react`: `19.1.1`
- `react-dom`: `19.1.1`

Frontend source imports `@supabase/supabase-js`, so removing the SDK merely to make the lockfile agree would regress existing runtime code and is not an accepted repair.

## Verification performed — 2026-08-07T22:17Z / 2026-08-08 03:47 IST

PR #58 head before evidence refresh: `e5a0a31e52f2c749c01d8bd11bd84adb11005c91`.

Observed GitHub Actions runs at that commit:

- `Repair Frontend Lockfile` run `31223011354`: failure.
  - initial job `93011408880`: completed failure with **0 executable steps** returned;
  - job log retrieval returned GitHub storage error `BlobNotFound`;
  - failed-jobs retry was explicitly requested through GitHub Actions and accepted;
  - retry job `93012398356`: queued, then completed failure with **0 executable steps** returned.
- `StreamVista Cloud X CI` run `31223010893`: failure; job `93011407069` returned no executable steps.
- `StreamVista Build and Recovery Check` run `31223011561`: failure; job `93011409585` returned no executable steps.

Base/head comparison `e4afd1bc...` → `e5a0a31e...` showed the repair branch was three commits ahead but changed only:

- `.github/workflows/repair-frontend-lockfile.yml`
- `docs/lockfile-repair-evidence.md`

`frontend/package-lock.json` was **not regenerated or committed**.

A Cloudflare branch preview was reported successful for the repair head, but that is not sufficient deterministic-install evidence because the stale lockfile remains and frontend `npm ci` has not been proven.

## Result

**P0 remains RED / DO NOT MERGE.**

The verified blocker is currently two-part:

1. manifest/lockfile drift is real and unresolved;
2. the observed GitHub Actions jobs are failing before executable steps start, so the intended automated lockfile regeneration and deterministic build gate have not run.

This evidence does **not** prove that npm dependency resolution itself fails. It proves that the GitHub runner path has not executed the npm commands needed to resolve and verify the repair.

## Safe repair / completion gates

1. regenerate `frontend/package-lock.json` from the committed `frontend/package.json` with Node 22/npm in a reproducible execution environment;
2. commit the synchronized lockfile on one canonical repair branch;
3. prove frontend `npm ci` succeeds;
4. run frontend production build;
5. run backend tests/build and required dependency/security checks;
6. restore deterministic `npm ci` in CI/deploy paths that were temporarily using `npm install`;
7. verify target deployment from the exact repaired commit;
8. verify runtime health;
9. update this incident with the exact commit/check/deployment evidence;
10. merge only after all required gates are green.

## Duplication control

PR #57 and PR #58 overlap. Do not independently merge both repair implementations. Preserve them unmerged while the runner blocker exists, then consolidate the verified repair/evidence into one canonical PR before promotion.

## Safety / rollback

- production remains untouched;
- `streamvista-cloud-x/main` remains unchanged by this verification pass;
- no force push, database, storage, domain, payment, billing, subscription, or destructive cleanup was performed;
- rollback is to leave the repair PRs unmerged or close the superseded duplicate after a single verified repair path is selected.
