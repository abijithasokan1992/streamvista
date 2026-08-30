import { Express, raw } from 'express';
import { createOrder } from './order';
import { verifyPayment } from './verify';
import { razorpayWebhook } from '../razorpay/webhook';
import { listRevenue } from '../revenue/list';

export function mountPaymentRoutes(app: Express, authMiddleware: any) {
  app.post('/api/payments/order', authMiddleware, createOrder);
  app.post('/api/payments/verify', authMiddleware, verifyPayment);
  app.post('/api/razorpay/webhook', raw({ type: 'application/json' }), razorpayWebhook);
  app.get('/api/revenue/list', authMiddleware, listRevenue);
}
