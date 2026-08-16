# StreamVista

Content licensing & distribution **web app** — rights, titles, screenings, creator/buyer workspaces.

[![Vercel Production](https://img.shields.io/github/deployments/abijithasokan1992/streamvista/Production?style=flat&logo=vercel&label=vercel%20production)](https://streamvista-ai-chat.vercel.app)
[![GitHub main](https://img.shields.io/badge/main-streamvista-111111?style=flat&logo=github)](https://github.com/abijithasokan1992/streamvista/tree/main)

**Production host:** [streamvista-ai-chat.vercel.app](https://streamvista-ai-chat.vercel.app)  
**Canonical domain (when mapped):** [streamvista.in](https://streamvista.in)

| Check | URL |
|--------|-----|
| Health | [/api/ready](https://streamvista-ai-chat.vercel.app/api/ready) |
| Login | [/login](https://streamvista-ai-chat.vercel.app/login) |

## Auth (MVP)

- Magic link only (no password on public UI)
- Join → role once (creator / buyer / investor / studio)
- Session → Dashboard
- Mail: Hostinger SMTP via Supabase (not Resend)

## Stack

React + TypeScript + Vite · Supabase Auth/RLS · Vercel

## Deploy

Vercel project **streamvista-ai-chat** · Git branch **`main`** · Root Directory = repo root.

Badge reflects GitHub **Production** deployment environment status for this repo. Confirm live UI on the host after each deploy.

## P0 gate (unchanged)

SQL #54 apply → Magic link → Dashboard → Title → Poster → Isolation → E2E → Certified → READY

Deployment badge green ≠ P0 certified.
