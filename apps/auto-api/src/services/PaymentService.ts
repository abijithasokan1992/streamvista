import Razorpay from 'razorpay';
import crypto from 'crypto';

function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith('YOUR_') || value.startsWith('your_')) throw new Error(`${name} is not configured`);
  return value;
}

function timingSafeEqualText(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getRazorpay() {
  return new Razorpay({ key_id: requireSecret('RAZORPAY_KEY_ID'), key_secret: requireSecret('RAZORPAY_KEY_SECRET') });
}

export class PaymentService {
  static async createRazorpayOrder(amount: number, currency = 'INR', receipt?: string) {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero');
    return getRazorpay().orders.create({ amount: Math.round(amount), currency, receipt: receipt || `sv_${Date.now()}` });
  }

  static async getOrder(orderId: string) {
    if (!orderId) throw new Error('Order id is required');
    return getRazorpay().orders.fetch(orderId);
  }

  static async getOrderAmount(orderId: string): Promise<number> {
    const order = await this.getOrder(orderId);
    const amount = Number((order as any)?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Razorpay order has invalid amount');
    return amount;
  }

  static verifySignature(orderId: string, paymentId: string, signature: string) {
    if (!orderId || !paymentId || !signature) return false;
    const expectedSignature = crypto.createHmac('sha256', requireSecret('RAZORPAY_KEY_SECRET')).update(`${orderId}|${paymentId}`).digest('hex');
    return timingSafeEqualText(expectedSignature, signature);
  }

  static verifyWebhook(rawBody: string, signature: string) {
    if (!rawBody || !signature) return false;
    const expectedSignature = crypto.createHmac('sha256', requireSecret('RAZORPAY_WEBHOOK_SECRET')).update(rawBody).digest('hex');
    return timingSafeEqualText(expectedSignature, signature);
  }
}
