# AI Command Center — GitHub Control Plane Phase 1

## Source of truth
- GitHub owner: `abijithasokan1992`
- Canonical repository: `abijithasokan1992/streamvista`
- Default branch: `main`
- Vercel project: `streamvista`
- Active Supabase project ref: `uakpqqardziifcwzvgfx`
- Retired Supabase reference has been removed from active configuration and must not be used as an environment binding.

## Architecture

```text
GitHub
  ↓
Server-side Sync API
  ↓
Repository Snapshot
  ↓
Agent/Config Discovery
  ↓
Audit Event
  ↓
AI Command Center UI
```

## Required server secrets
- `GITHUB_TOKEN`
- `GITHUB_ORG=abijithasokan1992`

`GITHUB_TOKEN` must remain server-side and must never be shipped to browser code.

## Sync acceptance criteria
1. Authenticate to GitHub server-side.
2. Discover repositories accessible to the configured owner/org.
3. Persist repository identity, default branch, visibility, archive state, and source commit metadata.
4. Discover agent/configuration candidates from repository content.
5. Persist a timestamped snapshot.
6. Record the sync attempt and outcome in an audit table.
7. Update the UI only from persisted snapshot data.
8. Preserve a failed-sync state without overwriting the last successful snapshot.
9. Manual sync must be idempotent for unchanged repository state.
10. No inventory count may be fabricated.

## Production truth rules