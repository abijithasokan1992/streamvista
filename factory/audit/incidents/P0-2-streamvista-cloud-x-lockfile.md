# P0-2 — streamvista-cloud-x lockfile drift

Status: verified configuration drift; repair pending
Priority: P0
Revenue impact: blocks reliable deployability of StreamVista Cloud X

## Evidence
Repository: `abijithasokan1992/streamvista-cloud-x`

`frontend/package.json` declares dependency:
- `@supabase/supabase-js`: `^2.55.0`

`frontend/package-lock.json` root package dependency list currently contains only:
- `react`: `19.1.1`
- `react-dom`: `19.1.1`

Therefore the frontend manifest and lockfile are out of sync.

## Safe repair
Regenerate/update `frontend/package-lock.json` from the current `frontend/package.json` on a short-lived fix branch, run install/build verification, then merge only after passing evidence.

## Completion gates
- manifest and lockfile synchronized
- frontend build succeeds
- Cloudflare/target deployment succeeds
- runtime health verified
- evidence updated here
