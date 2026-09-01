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

### Safety

- Never commit API secrets, service-role keys, database passwords, webhook secrets, OAuth tokens, or private credentials.
- Browser-visible `VITE_*` variables may contain only intended public configuration.
- Production changes require verification of the exact Git SHA and target environment.
- Payment, Auth, RLS/RBAC, webhook, and email E2E flows must be verified before release certification.

### Build

```bash
npm run typecheck
npm run build
```
