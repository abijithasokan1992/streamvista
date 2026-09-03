import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { requiredEnv, requiredUrlEnv } from '../config/env';
import { PaymentService } from '../services/PaymentService';
import { fail, ok } from '../lib/http';

const router = Router();
const SUPPORTED_EVENTS = new Set([
  'payment.authorized',
  'payment.captured',
  'payment.failed',
  'order.paid',
  'refund.created',
  'refund.processed',
  'refund.failed',
  'subscription.authenticated',
  'subscription.activated',
  'subscription.charged',
  'subscription.pending',
  'subscription.halted',
  'subscription.cancelled',
  'subscription.completed',
]);
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => fail(res, req, 429, { code: 'RATE_LIMITED', message: 'Too many requests. Please retry shortly.' }),
});

function admin() {
  return createClient(requiredUrlEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function rawBody(req: any): string {
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  return '';
}

export async function handleRazorpayWebhook(req: any, res: any) {
  try {
    const raw = rawBody(req);
    const signature = String(req.headers['x-razorpay-signature'] || '').trim();
    if (!signature) {
      return fail(res, req, 400, { code: 'SIGNATURE_REQUIRED', message: 'Webhook signature is required.' });
    }
    if (!raw || !PaymentService.verifyWebhook(raw, signature)) {
      return fail(res, req, 400, { code: 'INVALID_SIGNATURE', message: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(raw);
    const eventId = String(event?.id || '').trim();
    const eventName = String(event?.event || '').trim();
    if (!eventId) return fail(res, req, 400, { code: 'EVENT_ID_REQUIRED', message: 'Webhook event id is required.' });

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const db = admin();
    const { data: seen, error: seenError } = await db.from('sv_payment_webhook_events').select('event_id').eq('event_id', eventId).maybeSingle();
    if (seenError) return fail(res, req, 503, { code: 'WEBHOOK_LEDGER_LOOKUP_FAILED', message: 'Webhook processing is currently unavailable.' });
    if (seen) return ok(res, req, { accepted: true, duplicate: true }, 200);

    const payment = event?.payload?.payment?.entity;
    const { error: logError } = await db.from('sv_payment_webhook_events').insert({
      event_id: eventId,
      provider_event_id: eventId,
      event_name: eventName || 'unknown',
      payload_hash: payloadHash,
      payment_id: payment?.id || null,
      status: 'received',
      received_at: new Date().toISOString(),
    });
    if (logError) return fail(res, req, 503, { code: 'WEBHOOK_LEDGER_INSERT_FAILED', message: 'Webhook processing is currently unavailable.' });

    if (SUPPORTED_EVENTS.has(eventName) && ['payment.captured', 'payment.authorized', 'payment.failed'].includes(eventName) && payment?.order_id && payment?.id) {
      const status = eventName === 'payment.captured' ? 'captured' : eventName === 'payment.authorized' ? 'authorized' : 'failed';
      const { error: paymentError } = await db
        .from('sv_payments')
        .update({
          provider_payment_id: payment.id,
          provider_event_id: eventId,
          status,
          verified_at: new Date().toISOString(),
          raw_event_hash: payloadHash,
        })
        .eq('provider_order_id', payment.order_id)
        .eq('provider', 'razorpay');
      if (paymentError) {
        await db.from('sv_payment_webhook_events').update({ status: 'failed', processed_at: new Date().toISOString() }).eq('event_id', eventId);
        return fail(res, req, 503, { code: 'PAYMENT_UPDATE_FAILED', message: 'Webhook processing is currently unavailable.' });
      }
    }

    await db.from('sv_payment_webhook_events').update({
      status: SUPPORTED_EVENTS.has(eventName) ? 'processed' : 'failed',
      processed_at: new Date().toISOString(),
    }).eq('event_id', eventId);

    if (!SUPPORTED_EVENTS.has(eventName)) {
      return ok(res, req, { accepted: true, ignored: true, event: eventName || 'unknown' }, 202);
    }
    return ok(res, req, { accepted: true }, 200);
  } catch {
    return fail(res, req, 503, { code: 'WEBHOOK_HANDLER_FAILED', message: 'Webhook processing failed.' });
  }
}

router.post('/razorpay', webhookRateLimit, handleRazorpayWebhook);

export default router;
