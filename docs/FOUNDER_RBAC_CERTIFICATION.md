# Founder RBAC Certification

## Certification standard

Founder RBAC is certified only when all seven gates have reproducible evidence:

1. **Authentication** — the request carries a real authenticated Founder session/token.
2. **Role authority** — the server resolves `app_role` from the authenticated user's `sv_app_profiles` row.
3. **Authorization** — the protected API independently requires the server-derived role `founder`.
4. **Positive access** — the authenticated Founder receives `200` and a protected-resource success response.
5. **Negative access** — a non-Founder receives `403` for the same endpoint; no client role claim changes this.
6. **Audit** — every authorization decision is written to `sv_rbac_audit_log` by the server.
7. **Tamper resistance** — `?role=founder`, `x-role: founder`, and `{ "role": "founder" }` are ignored for authorization.

## Implemented path

- Protected endpoint: `POST /api/founder-rbac`
- Server policy: `api/founder-rbac-policy.mjs`
- Endpoint: `api/founder-rbac.mjs`
- Audit migration: `supabase/migrations/20260817_founder_rbac_certification.sql`
- Policy tests: `api/founder-rbac-policy.test.mjs`

The endpoint accepts the authenticated Supabase access token in `Authorization: Bearer <token>`. It does **not** accept a role as an authorization input.

## Required evidence run

### Founder positive

Use the real authenticated Founder session's Supabase access token and call:

```bash
curl -i -X POST 'https://streamvista-ai-chat.vercel.app/api/founder-rbac' \
  -H 'Authorization: Bearer <FOUNDER_ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"role":"admin"}'
```

Expected: `200`, `resolvedRole: "founder"`, `positiveAccess: "granted"`, and an `auditId`.

### Non-Founder negative

Use a real authenticated non-Founder token against the **same** endpoint:

```bash
curl -i -X POST 'https://streamvista-ai-chat.vercel.app/api/founder-rbac' \
  -H 'Authorization: Bearer <NON_FOUNDER_ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data '{"role":"founder"}'
```

Expected: `403`, with the response showing the server-resolved non-Founder role and an `auditId`.

### Tamper tests

Repeat the Founder and non-Founder calls with each of these mutations:

- `?role=founder`
- `x-role: founder`
- `x-user-role: founder`
- JSON body `{ "role": "founder" }`

The authorization result must remain determined solely by the authenticated user's server-derived `sv_app_profiles.app_role`.

## Local automated check

```bash
npm run test:rbac
```

## Certification decision

Do not mark **CERTIFIED** until the live positive, negative, audit, and tamper evidence has been captured after the migration is applied and the endpoint is deployed.
