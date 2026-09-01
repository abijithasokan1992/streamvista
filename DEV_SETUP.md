# StreamVista Development Setup

## Canonical development branch

Use `dev/streamvista-development-setup-20260901` for development work. It is based on the latest `main` commit at setup time.

## Runtime

- Node.js: 24.x
- Package manager: npm
- Frontend: Vite + React
- Frontend root: `apps/web/app`
- Vite entry: `apps/web/app/main.tsx`

## Install

```bash
nvm use
npm ci
```

If Node 24 is not available through nvm, install Node 24 first and rerun `nvm use`.

## Run frontend

```bash
npm run dev:web
```

The Vite development server is configured for port `8080` and binds to `0.0.0.0`.

## Run API separately

```bash
npm run dev:api
```

## Build frontend

```bash
npm run build:web
```

## Full typecheck

```bash
npm run typecheck
```

## Production-style frontend verification

```bash
npm ci
npm run build:web
```

Do not commit `.env.local` or secrets. Use the existing environment contract and local secret store for development values.
