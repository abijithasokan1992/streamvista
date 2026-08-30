import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value || value === 'YOUR_KEY_ID' || value === 'YOUR_KEY_SECRET') {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

class PaymentService {
  private razorpay: Razorpay | null = null;

  private getClient() {
    if (!this.razorpay) {
      this.razorpay = new Razorpay({
        key_id: requireSecret('RAZORPAY_KEY_ID'),
        key_secret: requireSecret('RAZORPAY_KEY_SECRET'),
      });
    }
    return this.razorpay;
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    return this.getClient().orders.create({ amount, currency, receipt });
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || !signature) return false;
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
    } catch {
      return false;
    }
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
    } catch {
      return false;
    }
  }
}

export const paymentService = new PaymentService();
