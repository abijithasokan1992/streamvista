import { Express, json, raw } from 'express';
import { createOrder } from './order';
import { verifyPayment } from './verify';
import { razorpayWebhook } from '../razorpay/webhook';
import { listRevenue } from '../revenue/list';

/**
 * Call AFTER cors() and BEFORE any other JSON parser.
 * Webhook is bound with express.raw() first so HMAC sees the unmodified body.
 * Then json() is installed so /order and /verify receive a parsed body.
 */
export function mountPaymentRoutes(app: Express, authMiddleware: any) {
  app.post('/api/razorpay/webhook', raw({ type: 'application/json' }), razorpayWebhook);
  app.use(json());
  app.post('/api/payments/order', authMiddleware, createOrder);
  app.post('/api/payments/verify', authMiddleware, verifyPayment);
  app.get('/api/revenue/list', authMiddleware, listRevenue);
}
