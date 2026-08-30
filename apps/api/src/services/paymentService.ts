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
  private client: Razorpay | null = null;

  private getClient() {
    if (!this.client) {
      this.client = new Razorpay({
        key_id: requireSecret('RAZORPAY_KEY_ID'),
        key_secret: requireSecret('RAZORPAY_KEY_SECRET'),
      });
    }
    return this.client;
  }

  async createOrder(amount: number, currency = 'INR', receipt: string) {
    return this.getClient().orders.create({ amount, currency, receipt });
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = requireSecret('RAZORPAY_KEY_SECRET');
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    return expected === signature;
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    const secret = requireSecret('RAZORPAY_WEBHOOK_SECRET');
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return expected === signature;
  }
}

export const paymentService = new PaymentService();
