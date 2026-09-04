# AI Command Center — GitHub Control Plane Phase 1

## Source of truth
- GitHub owner: `abijithasokan1992`
- Canonical repository: `abijithasokan1992/streamvista`
- Default branch: `main`
- Vercel project: `streamvista`
- Active Supabase project ref: `uakpqqardziifcwzvgfx`
- Retired Supabase project ref: `tqzimuwozhipqgyerdff` — historical only; never use as an active environment binding.

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
- `Never synced` remains until a successful snapshot exists.
- `Catalogued` is not equivalent to `implemented`.
- `Implemented` is not equivalent to `production`.
- Production status requires a live health check and audit evidence.
- Agent/tool execution must not bypass the platform API and tool gateway.
- Retired infrastructure references must never be promoted back to active environment bindings without explicit re-approval.

## Target architecture

```text
Apps
 ↓
Agent Platform API
 ↓
Orchestrator
 ↓
Canonical Agent
 ↓
Tool Gateway
 ↓
External Services
 ↓
Audit / Approval
 ↓
Verified Result
```

Phase 1 does not claim the Agent Platform API, Orchestrator, or Tool Gateway are production until each has independent health evidence.

## Phase 1 exit gate

```text
GITHUB_TOKEN configured
       ↓
Run GitHub sync
       ↓
Successful snapshot persisted
       ↓
Repository count > 0
       ↓
Audit event persisted
       ↓
Command Center shows last successful snapshot
       ↓
No credential exposed to browser
       ↓
PHASE 1 = GREEN
```
