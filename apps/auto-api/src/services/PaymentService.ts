import Razorpay from 'razorpay';
import crypto from 'crypto';

function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith('YOUR_') || value.startsWith('your_')) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function timingSafeEqualText(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getRazorpay() {
  return new Razorpay({
    key_id: requireSecret('RAZORPAY_KEY_ID'),
    key_secret: requireSecret('RAZORPAY_KEY_SECRET'),
  });
}

export class PaymentService {
  static async createRazorpayOrder(amount: number, currency: string = 'INR', receipt?: string) {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero');
    const options = {
      amount: Math.round(amount),
      currency,
      receipt: receipt || `sv_${Date.now()}`,
    };
    return getRazorpay().orders.create(options);
  }

  static verifySignature(orderId: string, paymentId: string, signature: string) {
    if (!orderId || !paymentId || !signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', requireSecret('RAZORPAY_KEY_SECRET'))
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return timingSafeEqualText(expectedSignature, signature);
  }

  static verifyWebhook(rawBody: string, signature: string) {
    if (!rawBody || !signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', requireSecret('RAZORPAY_WEBHOOK_SECRET'))
      .update(rawBody)
      .digest('hex');
    return timingSafeEqualText(expectedSignature, signature);
  }
}
