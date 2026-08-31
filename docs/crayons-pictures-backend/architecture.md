# Crayons Pictures — Real Backend Architecture

```text
                    ┌──────────────────────────┐
                    │   Web / Vercel + React   │
                    └────────────┬─────────────┘
                                 │ Bearer session
                    ┌────────────▼─────────────┐
                    │     Vercel /api/index    │
                    │ Auth • RBAC • Validation │
                    └──────┬──────┬────────────┘
                           │      │
              ┌────────────┘      └───────────────┐
              ▼                                    ▼
    ┌─────────────────────┐              ┌─────────────────────┐
    │ Supabase PostgreSQL │              │ Secure providers   │
    │ Auth / RLS / Jobs   │              │ AI / Razorpay/Mail │
    │ Audit / Rights      │              │ server-side only   │
    └─────────┬───────────┘              └──────────┬──────────┘
              │                                     │
              └────────────────┬────────────────────┘
                               ▼
                   ┌──────────────────────────┐
                   │ Persistent Job / Result  │
                   │ status + evidence        │
                   └────────────┬─────────────┘
                                │
                      ┌─────────▼──────────┐
                      │ Expo Native Client │
                      │ same API contract  │
                      └────────────────────┘
```

## Boundary rules

1. Frontend and Expo never hold provider secrets.
2. Supabase service-role credentials are server-only.
3. User-supplied roles are never trusted; derive role from `sv_app_profiles`/authoritative server data.
4. Rights-sensitive actions require an approval record before execution.
5. AI/rendering requests create persistent jobs; UI status is a projection of job state.
6. Payments are finalized from verified Razorpay events, not client callbacks alone.
7. Email is emitted server-side and recorded as an auditable event.
8. Analytics identifiers are non-sensitive and must not contain access tokens, payment secrets, or raw media.
9. All production schema changes are migration-first and reproducible.
10. Legacy datasets remain reference/lineage sources; new product writes target the canonical product tables.
