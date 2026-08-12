# StreamVista production runbook

The product is one deployable Node service: React frontend, same-origin API, secure cookie sessions, server-side RBAC, audit log, and SQLite persistence.

## Required configuration

- Mount a durable volume at `/data`.
- Set `APP_ORIGIN` to the exact HTTPS public origin.
- On first boot only, set `SEED_OWNER_EMAIL` and a unique password of at least 12 characters; remove both after the founder account exists.
- Keep `DATABASE_PATH=/data/streamvista.sqlite` and back up the volume.
- Terminate TLS at the hosting platform.

## Release verification

Run `npm ci`, `npm test`, `npm run lint`, `npm run verify:rule77`, `npm run build`, and `npm audit --audit-level=high`. After deployment verify `/api/health`, `/api/ready`, login/logout, creator isolation, buyer assignment isolation, and admin-only user listing.
