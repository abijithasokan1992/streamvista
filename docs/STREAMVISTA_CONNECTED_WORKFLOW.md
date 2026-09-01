# StreamVista Connected Workflow

## Default operating rule

When the relevant authenticated integrations are available, do not repeatedly request reconnection for ordinary StreamVista build, verification, deployment, and certification work.

Use the available connected services directly for the required workflow:

GitHub → Vercel → Supabase → Razorpay → Hostinger Mail → Gmail → Verify → Deploy → Certify

## Execution rules

- Reuse valid OAuth/authenticated connections when available.
- Use a new integration only when it is genuinely required by the task.
- Build, test, deploy, and verify naturally as part of the task when supported.
- Do not pretend access exists; report permission-denied or unavailable connectors as real blockers.
- Require explicit approval only for high-impact actions such as permission escalation, credential changes, or real payment charges when the platform requires confirmation.
- Never expose server secrets in frontend variables or source control.
- Keep final production certification evidence-based and service-by-service.

## Canonical systems

- GitHub repository: `abijithasokan1992/streamvista`
- Production branch: `main`
- Vercel canonical project: `streamvista`
- Production domain: `https://streamvista.in`
- Supabase: authoritative production project must be independently verified before production changes.
- Razorpay: server-side billing, payment verification, webhook processing, and reconciliation.
- Hostinger Mail: transactional/inbound mail infrastructure.
- Gmail: operational communications through an available approved Gmail connector/MCP integration.
