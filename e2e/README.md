# StreamVista P0 E2E automation

Locked gate remains manual-certification-first. These scripts **assist** verification; they do not auto-declare Production READY.

## Layers

| Layer | Tool | Covers |
|-------|------|--------|
| Public host smoke | Playwright | `/login` 200, no crash |
| RLS / data isolation | `scripts/e2e-p0-rls.mjs` | anon 0 rows, owner vs other |
| Magic link | Manual or mail inbox API | Session → dashboard |

## Prerequisites

1. `#54` applied on `uakpqqardziifcwzvgfx`
2. Production host READY: `https://streamvista-ai-chat.vercel.app`
3. Env (local only — never commit):

```bash
export E2E_BASE_URL=https://streamvista-ai-chat.vercel.app
export SUPABASE_URL=https://uakpqqardziifcwzvgfx.supabase.co
export SUPABASE_ANON_KEY=...          # publishable
export E2E_CREATOR_EMAIL=...
export E2E_CREATOR_PASSWORD=...       # only if password users exist; prefer service seed
export E2E_SERVICE_ROLE_KEY=...       # server-only seed/cleanup — CI secret
```

Magic-link-only projects: seed users with service role, then use password grant for test users **or** run A1–A3 manually and use RLS script for C/D/F data cases.

## Commands

```bash
npm i -D @playwright/test
npx playwright install chromium
npm run test:e2e:smoke
npm run test:e2e:rls
```

## Certification

Automated green ≠ P0 ✅. Human confirms Magic link → Dashboard → Title → Poster → isolation, then certify.
