# Change list — feat/razorpay-revenue-e2e

Added:
- apps/api/src/routes/payments/order.ts
- apps/api/src/routes/payments/verify.ts
- apps/api/src/routes/razorpay/webhook.ts
- apps/api/src/routes/revenue/list.ts
- apps/api/src/routes/payments/mount.ts
- paymentService.ts fail-closed (no YOUR_KEY_* fallback)

Wire in server.ts (one call):
```
import { mountPaymentRoutes } from './routes/payments/mount';
mountPaymentRoutes(app, authenticateToken);
```

Env required on API host:
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Not certified: live Razorpay E2E, webhook delivery, sv_payments row on prod.
