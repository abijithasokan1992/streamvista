# StreamVista Final MVP host (locked)

**Date locked:** 2026-08-16  
**Last deploy trigger:** 2026-08-16 (Rocket home #53 + magic link #52 on main)

## Canonical MVP host

| Role | URL |
|------|-----|
| **MVP host** | https://streamvista-ai-chat.vercel.app |
| Login (magic link) | https://streamvista-ai-chat.vercel.app/login |
| Chat | https://streamvista-ai-chat.vercel.app/chat |
| Health | https://streamvista-ai-chat.vercel.app/api/ready |

**Required ready shape:**

```json
{"status":"ready","database":"connected"}
```

## UX on this host (main)

- Home: Rocket-style open chat box + soft **Enter** (PR #53)
- Auth: passwordless magic link (PR #52)
- Principle: Home invites · magic link admits · RBAC protects · AI guides

## Explicit non-hosts

| Surface | Reason |
|---------|--------|
| https://streamvista-black.vercel.app | database=unconfigured until env bind |
| vista-os-v1-command-center | Deploy ERROR / NOT_FOUND |
| https://streamvista.in | Marketing |

## Supabase

- Ref: `tqzimuwozhipqgyerdff`
- Redirect allow: `https://streamvista-ai-chat.vercel.app/**`

## Rule

All Final MVP demos and auth tests use **streamvista-ai-chat** until this document is updated by explicit decision.
