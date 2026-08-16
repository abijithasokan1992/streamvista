# StreamVista Final MVP host (locked)

**Date locked:** 2026-08-16

## Canonical MVP host

| Role | URL |
|------|-----|
| **MVP host** | https://streamvista-ai-chat.vercel.app |
| Login | https://streamvista-ai-chat.vercel.app/login |
| Health | https://streamvista-ai-chat.vercel.app/api/ready |

**Required ready shape:**

```json
{"status":"ready","database":"connected"}
```

## Explicit non-hosts (do not treat as MVP production)

| Surface | Reason |
|---------|--------|
| https://streamvista-black.vercel.app | `database=unconfigured` until Vercel env bind |
| vista-os-v1-command-center | Deploy ERROR / DEPLOYMENT_NOT_FOUND |
| https://streamvista.in | Public marketing site |

## Supabase

- Canonical project ref: `uakpqqardziifcwzvgfx`
- URL: `https://uakpqqardziifcwzvgfx.supabase.co`
- Official account: `abijithasokan@crayonspictures.com`
- Do not point MVP host at Crayons Bridge or personal-gmail projects

## Product

Content licensing / distribution **web app** (not website-only).

## Still open after host lock

- Apply/verify auth trigger (PR #43 path) + RLS on canonical DB
- E2E: creator signup → upload; buyer pending → admin verify → screening
- Redeploy MVP host from latest `main` so Create Account role selector (#51) is live
- Production Ready certificate only after Runtime + Auth + RLS + E2E PASS on **this** host

## Rule

All Final MVP demos, auth tests, and “is it up?” checks use **streamvista-ai-chat** until this document is updated by explicit decision.
