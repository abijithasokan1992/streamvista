import { Router } from 'express';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/', express.raw({ type: 'application/json' }), async (req: any, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (!raw || !PaymentService.verifyWebhook(raw, signature)) return res.status(400).json({ error: 'Invalid webhook signature' });
    const event = JSON.parse(raw);
    const eventId = String(event?.id || '').trim();
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const client = db();
    const payment = event?.payload?.payment?.entity;
    const { data: existing } = await client.from('sv_payment_webhook_events').select('event_id').eq('event_id', eventId).maybeSingle();
    if (existing) return res.status(200).json({ ok: true, duplicate: true });

    const { error: logError } = await client.from('sv_payment_webhook_events').insert({
      event_id: eventId,
      provider_event_id: eventId,
      event_name: event?.event || 'unknown',
      payload_hash: payloadHash,
      payment_id: payment?.id || null,
    });
    if (logError) return res.status(503).json({ error: logError.message });

    if (event?.event === 'payment.captured' && payment?.order_id && payment?.id) {
      await client.from('sv_payments').upsert({
        user_id: payment?.notes?.userId || payment?.notes?.user_id || null,
        title_id: payment?.notes?.titleId || payment?.notes?.title_id || null,
        provider_order_id: payment.order_id,
        provider_payment_id: payment.id,
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency || 'INR',
        status: 'captured',
        verified_at: new Date().toISOString(),
        idempotency_key: `${payment.order_id}:${payment.id}`,
      }, { onConflict: 'idempotency_key' });
    }
    await client.from('sv_payment_webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('event_id', eventId);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Webhook failed closed' });
  }
});

export default router;
