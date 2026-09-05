import { Router } from 'express';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is missing');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
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
    const paymentEntity = event?.payload?.payment?.entity;
    const providerPaymentId = String(paymentEntity?.id || '').trim();
    const providerOrderId = String(paymentEntity?.order_id || '').trim();
    const client = db();

    const { data: existingEvent, error: existingEventError } = await client
      .from('sv_payment_webhook_events')
      .select('event_id')
      .eq('event_id', eventId)
      .maybeSingle();
    if (existingEventError) return res.status(503).json({ error: existingEventError.message });
    if (existingEvent) return res.status(200).json({ ok: true, duplicate: true });

    let internalPaymentId: string | null = null;
    let linkedDealId: string | null = null;

    if (providerOrderId) {
      const { data: linkedPayment, error: linkedPaymentError } = await client
        .from('sv_payments')
        .select('id,deal_id')
        .eq('provider', 'razorpay')
        .eq('provider_order_id', providerOrderId)
        .maybeSingle();
      if (linkedPaymentError) return res.status(503).json({ error: linkedPaymentError.message });
      internalPaymentId = linkedPayment?.id || null;
      linkedDealId = linkedPayment?.deal_id || null;
    }

    const { error: logError } = await client.from('sv_payment_webhook_events').insert({
      event_id: eventId,
      event_name: event?.event || 'unknown',
      payload_hash: payloadHash,
      payment_id: internalPaymentId,
      received_at: new Date().toISOString(),
      status: 'received',
    });
    if (logError) return res.status(503).json({ error: logError.message });

    if (providerOrderId && providerPaymentId && ['payment.captured', 'payment.authorized', 'payment.failed', 'payment.refunded'].includes(event?.event)) {
      const status = event.event === 'payment.captured'
        ? 'captured'
        : event.event === 'payment.authorized'
          ? 'authorized'
          : event.event === 'payment.refunded'
            ? 'refunded'
            : 'failed';

      const { data: paymentRow, error: paymentError } = await client
        .from('sv_payments')
        .update({
          provider_payment_id: providerPaymentId,
          provider_event_id: eventId,
          status,
          verified_at: new Date().toISOString(),
          raw_event_hash: payloadHash,
          error_reason: event.event === 'payment.failed'
            ? String(paymentEntity?.error_description || paymentEntity?.error_reason || '').trim() || null
            : null,
        })
        .eq('provider', 'razorpay')
        .eq('provider_order_id', providerOrderId)
        .select('id,deal_id')
        .maybeSingle();

      if (paymentError) return res.status(503).json({ error: paymentError.message });
      linkedDealId = paymentRow?.deal_id || linkedDealId;
    }

    if (linkedDealId && event?.event === 'payment.captured') {
      const { error: dealError } = await client
        .from('sv_marketplace_deals')
        .update({ payment_status: 'captured' })
        .eq('id', linkedDealId);
      if (dealError) return res.status(503).json({ error: dealError.message });
    }

    if (linkedDealId && event?.event === 'payment.refunded') {
      const { error: dealError } = await client
        .from('sv_marketplace_deals')
        .update({ payment_status: 'refunded' })
        .eq('id', linkedDealId);
      if (dealError) return res.status(503).json({ error: dealError.message });
    }

    const { error: processedError } = await client
      .from('sv_payment_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', eventId);
    if (processedError) return res.status(503).json({ error: processedError.message });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Webhook failed closed' });
  }
});

export default router;
