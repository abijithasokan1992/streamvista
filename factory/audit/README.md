# FACTORY Audit & Evidence Space

Canonical audit/evidence storage for the entire StreamVista FACTORY.

Do not create separate audit repositories per product, agent, tool, or deployment. Keep all verification evidence here, organized by domain, while product runtime code remains untouched.

## Structure
- `products/` — product health, release and Golden Baseline evidence
- `agents/` — agent certification, health and execution evidence
- `tools/` — connector/MCP/tool verification
- `deployments/` — deployment health, rollback and release evidence
- `incidents/` — incident records and recovery evidence
- `security/` — security verification evidence
- `revenue/` — revenue-flow verification only (payment links, checkout, transaction-path evidence; never secrets)

## Rules
1. Evidence only; no secrets, API keys, tokens, passwords, private customer data, or payment credentials.
2. Main product code is not changed by audit storage.
3. Every record must identify component, repository/ref, timestamp, result, and proof source.
4. `live` or `fixed` status requires verification evidence.
5. Historical evidence is append-only; corrections must add a new record rather than rewrite history.
6. Audit work must not block revenue-facing execution unless it discovers a critical production/security blocker.
