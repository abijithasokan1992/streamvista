import Razorpay from 'razorpay';
import crypto from 'crypto';

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay server credentials are not configured');
  }
  return { keyId, keySecret };
}

function getClient() {
  const { keyId, keySecret } = getCredentials();
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

function timingSafe(expectedHex: string, signature: string) {
  const expected = Buffer.from(expectedHex, 'utf8');
  const received = Buffer.from(signature, 'utf8');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export class PaymentService {
  static async createRazorpayOrder(amount: number, currency: string = 'INR') {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    const { client, keyId } = getClient();
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    try {
      const order = await client.orders.create(options);
      return { order, keyId };
    } catch (err) {
      console.error('Razorpay Order Creation Error:', err);
      throw new Error('Failed to initiate payment with Razorpay');
    }
  }

  static verifySignature(orderId: string, paymentId: string, signature: string) {
    if (!orderId || !paymentId || !signature) return false;
    const { keySecret } = getCredentials();
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    return timingSafe(expectedSignature, signature);
  }

  static verifyWebhookSignature(rawBody: Buffer | string, signature: string) {
    if (!signature) return false;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return false;
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    return timingSafe(expectedSignature, signature);
  }
}
