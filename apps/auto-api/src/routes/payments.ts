import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';
import { SupabasePaymentService } from '../services/SupabasePaymentService';

const router = Router();

async function createOrder(req: any, res: any) {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const { amount, titleId, dealId, purpose, idempotencyKey: bodyKey } = req.body || {};
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    if (!titleId && !dealId) {
      return res.status(400).json({ error: 'Title or deal is required' });
    }
    if (titleId && !/^[0-9a-f-]{36}$/i.test(String(titleId))) {
      return res.status(400).json({ error: 'Invalid title id' });
    }
    if (dealId && !/^[0-9a-f-]{36}$/i.test(String(dealId))) {
      return res.status(400).json({ error: 'Invalid deal id' });
    }
    const headerKey = String(req.headers['idempotency-key'] || bodyKey || '').trim();

    const result = await PaymentService.createRazorpayOrder(normalizedAmount, 'INR');
    const payment = await SupabasePaymentService.createPayment({
      userId: req.user.userId,
      titleId: titleId || null,
      dealId: dealId || null,
      amount: normalizedAmount,
      currency: result.order.currency || 'INR',
      providerOrderId: result.order.id,
      idempotencyKey: headerKey || `payment:${req.user.userId}:${result.order.id}`,
      purpose: purpose || 'marketplace_license',
    });

    res.json({ ...result, payment });
  } catch (err: any) {
    const message = err?.message || 'Payment configuration unavailable';
    const status = /credentials|configured|invalid payment amount/i.test(message) ? 503 : 500;
    res.status(status).json({ error: message });
  }
}

router.post('/create-order', createOrder);
router.post('/order', createOrder);

router.post('/verify', async (req: any, res) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const orderId = req.body?.razorpay_order_id || req.body?.orderId;
    const paymentId = req.body?.razorpay_payment_id || req.body?.paymentId;
    const signature = req.body?.razorpay_signature || req.body?.signature;
    const isValid = PaymentService.verifySignature(orderId, paymentId, signature);
    if (!isValid) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const payment = await SupabasePaymentService.markVerified({
      providerOrderId: orderId,
      providerPaymentId: paymentId,
    });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment order not found' });

    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Payment verification failed' });
  }
});

export default router;
