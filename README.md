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

## Canonical Repository Layout

```text
streamvista/
├── .github/
│   └── workflows/          # GitHub Actions (CI/CD Deployments)
├── agents/                 # Vertex AI Agent Engine Logic
│   ├── __init__.py
│   ├── reasoning_engine.py # Vertex AI Agent SDK Init & Main Logic
│   └── sub_agents/         # A2A Network Sub-agents
│       ├── ingest_guard.py
│       ├── qc_sentinel.py
│       ├── rights_bridge.py
│       └── loop_monetizer.py
├── scripts/
│   └── iam_setup.sh        # IAM & Service Account CLI Directives
├── config/
│   └── GCP_CONFIG.json     # Project ID, Location, Resource IDs
├── requirements.txt        # Python Dependencies
└── README.md
```

### Vertex Runtime Configuration

The canonical GCP runtime configuration is stored in `config/GCP_CONFIG.json`. Credentials and service-account secrets are never committed to the repository; `scripts/iam_setup.sh` validates the authenticated deployment environment instead.
