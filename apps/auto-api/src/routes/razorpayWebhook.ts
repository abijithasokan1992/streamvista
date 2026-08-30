import crypto from 'crypto';
import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { SupabasePaymentService } from '../services/SupabasePaymentService';

export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const raw = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : '');
    if (!PaymentService.verifyWebhookSignature(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    const event = JSON.parse(raw.toString('utf8'));
    const payment = event?.payload?.payment?.entity;
    const eventId = String(event?.id || payment?.id || '');
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });
    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const eventName = String(event?.event || 'unknown');
    const status =
      eventName === 'payment.captured' ? 'captured' : eventName === 'payment.failed' ? 'failed' : 'authorized';
    const result = await SupabasePaymentService.applyWebhook({
      eventId,
      eventName,
      payloadHash,
      providerPaymentId: payment?.id,
      providerOrderId: payment?.order_id,
      status,
      receivedAt: new Date().toISOString(),
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error: any) {
    return res.status(503).json({ error: error?.message || 'Webhook failed closed' });
  }
}
