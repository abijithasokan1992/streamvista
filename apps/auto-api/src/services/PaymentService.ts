import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
});

export class PaymentService {
  static async createRazorpayOrder(amount: number, currency: string = 'INR') {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (err) {
      console.error('Razorpay Order Creation Error:', err);
      throw new Error('Failed to initiate payment with Razorpay');
    }
  }

  static verifySignature(orderId: string, paymentId: string, signature: string) {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }
}
