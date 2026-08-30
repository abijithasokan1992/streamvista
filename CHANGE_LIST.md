# Rule 77 — payment routes applied, WAIT on mount/merge

Applied to `codex/rule77-production-completion`:
- order/verify/webhook/revenue using provider_* columns
- fail-closed paymentService + verifyWebhook
- mount helper registers webhook raw FIRST

NOT done:
- server.ts mount (monolith; no whole-file replace)
- PR #114 merge
- live ₹1 / sv_payments row
