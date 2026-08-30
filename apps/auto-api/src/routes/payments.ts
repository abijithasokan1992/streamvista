import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';
import { OrderService } from '../services/OrderService';

const router = Router();

router.post('/create-order', async (req: any, res) => {
  try {
    const { amount } = req.body;
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const result = await PaymentService.createRazorpayOrder(Number(amount), 'INR');
    res.json(result);
  } catch (err: any) {
    const message = err?.message || 'Payment configuration unavailable';
    const status = /credentials|configured|invalid payment amount/i.test(message) ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

router.post('/verify', async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
    const isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const finalOrderData = {
      ...(orderData || {}),
      customerId: req.user.userId,
      paymentId: razorpay_payment_id,
    };
    if (!Array.isArray(finalOrderData.items) || finalOrderData.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order items are required' });
    }
    const orderId = await OrderService.createOrder(finalOrderData);
    res.json({ success: true, orderId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Payment verification failed' });
  }
});

export default router;
