import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';
import { SupabasePaymentService } from '../services/SupabasePaymentService';

const router = Router();

router.post('/create-order', async (req: any, res) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const { amount, assetId, titleId, dealId, purpose } = req.body || {};
    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const result = await PaymentService.createRazorpayOrder(normalizedAmount, 'INR');
    const idempotencyKey = `payment:${req.user.userId}:${result.order.id}`;
    const payment = await SupabasePaymentService.createPayment({
      userId: req.user.userId,
      titleId: titleId || assetId || null,
      dealId: dealId || null,
      amount: normalizedAmount,
      currency: result.order.currency || 'INR',
      providerOrderId: result.order.id,
      idempotencyKey,
      purpose: purpose || 'marketplace_license',
    });

    res.json({ ...result, payment });
  } catch (err: any) {
    const message = err?.message || 'Payment configuration unavailable';
    const status = /credentials|configured|invalid payment amount/i.test(message) ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

router.post('/verify', async (req: any, res) => {
  try {
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    const isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const payment = await SupabasePaymentService.markVerified({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
    });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment order not found' });

    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Payment verification failed' });
  }
});

export default router;
