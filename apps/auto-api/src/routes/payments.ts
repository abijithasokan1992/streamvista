import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';
import { OrderService } from '../services/OrderService';

const router = Router();

router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await PaymentService.createRazorpayOrder(amount);
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    
    const isValid = PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (isValid) {
      // Payment verified, now create the actual order in our DB
      const finalOrderData = {
        ...orderData,
        paymentId: razorpay_payment_id
      };
      const orderId = await OrderService.createOrder(finalOrderData);
      res.json({ success: true, orderId });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
