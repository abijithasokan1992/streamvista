import { Router } from 'express';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

router.post('/', express.raw({ type: 'application/json' }), async (req: any, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (!raw || !signature || !PaymentService.verifyWebhook(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(raw);
    const eventId = String(event?.id || '').trim();
    const eventName = String(event?.event || '').trim();
    if (!eventId || !eventName) return res.status(400).json({ error: 'Missing event identity' });

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const client = db();
    const payment = event?.payload?.payment?.entity || null;

    const { data: existing, error: existingError } = await client
      .from('sv_payment_webhook_events')
      .select('event_id,status')
      .eq('event_id', eventId)
      .maybeSingle();
    if (existingError) return res.status(503).json({ error: existingError.message });
    if (existing?.status === 'processed') return res.status(200).json({ ok: true, duplicate: true });

    if (!existing) {
      const { error: logError } = await client.from('sv_payment_webhook_events').insert({
        event_id: eventId,
        event_name: eventName,
        payload_hash: payloadHash,
        payment_id: payment?.id || null,
        received_at: new Date().toISOString(),
        status: 'received',
      });
      if (logError && logError.code !== '23505') return res.status(503).json({ error: logError.message });
    }

    if (['payment.captured', 'payment.authorized', 'payment.failed'].includes(eventName) && payment?.order_id && payment?.id) {
      const status = eventName === 'payment.captured' ? 'captured' : eventName === 'payment.authorized' ? 'authorized' : 'failed';
      const { data: paymentRow, error } = await client
        .from('sv_payments')
        .update({
          provider_payment_id: payment.id,
          provider_order_id: payment.order_id,
          provider_event_id: eventId,
          status,
          verified_at: new Date().toISOString(),
          raw_event_hash: payloadHash,
          error_reason: payment.error_reason || payment.error_description || null,
        })
        .eq('provider_order_id', payment.order_id)
        .eq('provider', 'razorpay')
        .select('id,deal_id')
        .maybeSingle();
      if (error) return res.status(503).json({ error: error.message });

      if (paymentRow?.deal_id && status === 'captured') {
        const { error: dealError } = await client
          .from('sv_marketplace_deals')
          .update({ payment_status: 'paid', stage: 'active' })
          .eq('id', paymentRow.deal_id);
        if (dealError) return res.status(503).json({ error: dealError.message });
      }
    }

    if (['refund.created', 'refund.processed'].includes(eventName)) {
      const refund = event?.payload?.refund?.entity || null;
      if (refund?.payment_id) {
        const { data: paymentRow, error } = await client
          .from('sv_payments')
          .select('id,deal_id')
          .eq('provider_payment_id', refund.payment_id)
          .eq('provider', 'razorpay')
          .maybeSingle();
        if (error) return res.status(503).json({ error: error.message });
        if (paymentRow) {
          const { error: paymentError } = await client
            .from('sv_payments')
            .update({
              status: 'refunded',
              provider_event_id: eventId,
              verified_at: new Date().toISOString(),
              raw_event_hash: payloadHash,
            })
            .eq('id', paymentRow.id);
          if (paymentError) return res.status(503).json({ error: paymentError.message });

          if (paymentRow.deal_id) {
            const { error: dealError } = await client
              .from('sv_marketplace_deals')
              .update({ payment_status: 'refunded' })
              .eq('id', paymentRow.deal_id);
            if (dealError) return res.status(503).json({ error: dealError.message });
          }
        }
      }
    }

    const { error: finalizeError } = await client
      .from('sv_payment_webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', eventId);
    if (finalizeError) return res.status(503).json({ error: finalizeError.message });

    return res.status(200).json({ ok: true, processed: true });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Webhook failed closed' });
  }
});

export default router;
