# StreamVista

## Basic Platform Backend

This repository is the canonical source for the StreamVista platform.

### Production chain

Customer → StreamVista/Vercel → Supabase Auth + DB + Storage → Razorpay Billing → Hostinger Mail

### Core release contract

- GitHub `main` is the source of truth for deployable application changes.
- Vercel serves the production application and custom domain.
- Supabase provides authentication, database, storage, and server-side functions.
- Razorpay provides payment processing and billing events.
- Hostinger Mail provides transactional and inbound mail infrastructure.
- Current release-gate evidence is recorded in `docs/STREAMVISTA_PRODUCTION_RELEASE_GATE_2026-09-02.md`.

### Safety

- Never commit API secrets, service-role keys, database passwords, webhook secrets, OAuth tokens, or private credentials.
- Browser-visible `VITE_*` variables may contain only intended public configuration.
- Production changes require verification of the exact Git SHA and target environment.
- Payment, Auth, RLS/RBAC, webhook, and email E2E flows must be verified before release certification.

### Build

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Canonical production boundary

- Frontend: `apps/web`
- Backend API: `apps/auto-api` via `api/entrypoint.ts`
- Legacy/non-production candidates (`apps/auto-web`, `visual-guardian`) are not release-blocking for canonical production until explicitly promoted.
