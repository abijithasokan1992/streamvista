# Change list - feat/razorpay-revenue-e2e

- Removed the broken Vercel `/api/*` rewrite to `command.streamvista.in`, which currently returns `DEPLOYMENT_NOT_FOUND`.
- Pointed plan checkout to the deployed Vercel payment functions: `/api/payment/create-plan-order` and `/api/payment/verify-plan-payment`.
- Added plural compatibility functions for `/api/payments/create-order` and `/api/payments/verify`.
- Added the `onboarding_requests` plan checkout ledger migration with RLS and service-role grants.
- Writes plan orders into `sv_payments` so captured payments appear in revenue/finance records.
- Removed hardcoded production secrets from `scripts/provision_prod.sh`.

WAIT: not production-ready until the PR is deployed, the Supabase migration is applied to the canonical project, Razorpay webhook is set to `https://streamvista.in/api/webhooks/razorpay`, and one live low-value payment plus webhook row is observed.
