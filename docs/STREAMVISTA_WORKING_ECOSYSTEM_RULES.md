# StreamVista — Working Ecosystem Rules

## Permanent Working Connections

For StreamVista operations, use the connected systems below as the central working ecosystem whenever actual access is available:

- Coda
- GitHub
- Vercel
- Supabase
- Razorpay
- Hostinger Mail

## Multi-Device Rule

The StreamVista workflow is intended to continue across the Founder’s authorized Phone, Laptop, MacBook, Desktop, and other authorized devices using the same authorized account/workspace connections.

Changing devices must not be treated as a reason to redesign or recreate the workflow. Re-authorization is required only when the connector/account authorization, workspace permission, session, or underlying access has actually changed or is unavailable.

## Execution Rule

For StreamVista work:

1. Verify actual access.
2. Inspect the existing implementation and infrastructure.
3. Reuse existing capabilities before building new ones.
4. Execute only against the verified canonical project/repository/environment.
5. Test and verify the result.
6. Promote/deploy only after the required release gates pass.

## No-Assumption Rule

- Do not assume access that has not been verified.
- Do not fabricate access, deployment status, database state, payment state, or email state.
- If a required service/project is not exposed or cannot be verified, flag it clearly as a blocker.
- Do not rebuild when a compatible existing implementation can be reused.

## Canonical Repository

Current canonical GitHub repository:

`abijithasokan1992/streamvista`

`main` is the source of truth for deployable application changes unless an explicitly verified release process states otherwise.

## Production Chain

Customer → StreamVista/Vercel → Supabase Auth + DB + Storage → Razorpay Billing → Hostinger Mail

## Security

Never commit API secrets, service-role keys, database passwords, webhook secrets, OAuth tokens, or other private credentials to GitHub. Keep secrets in the appropriate secure environment/configuration store.

## Core Principle

**One Account. Multiple Devices. One StreamVista Working Ecosystem.**

**Assume ചെയ്യരുത്. Fabricate ചെയ്യരുത്. Verify ചെയ്തതിന് ശേഷം മാത്രം Execute ചെയ്യുക.**
