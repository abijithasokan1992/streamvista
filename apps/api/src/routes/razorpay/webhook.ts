import crypto from 'crypto';
import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { paymentService } from '../../services/paymentService';

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

function rawBody(req: Request): string | null {
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (typeof req.body === 'string') return req.body;
  return null;
}

export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const raw = rawBody(req);
    if (raw == null) {
      return res.status(400).json({ error: 'Webhook body must be raw JSON before the parser' });
    }
    if (!signature || !paymentService.verifyWebhook(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(raw);
    const providerEventId = String(event?.id || event?.payload?.payment?.entity?.id || '');
    if (!providerEventId) return res.status(400).json({ error: 'Missing event id' });

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const db = admin();
    const { data: seen } = await db
      .from('sv_payment_webhook_events')
      .select('id')
      .eq('provider_event_id', providerEventId)
      .maybeSingle();
    if (seen) return res.status(200).json({ ok: true, duplicate: true });

    const payment = event.payload?.payment?.entity;
    const { error: logError } = await db.from('sv_payment_webhook_events').insert({
      provider_event_id: providerEventId,
      event_id: providerEventId,
      event_name: event?.event || 'unknown',
      payload_hash: payloadHash,
      payment_id: payment?.id || null,
      received_at: new Date().toISOString(),
    });
    if (logError) return res.status(503).json({ error: logError.message });

    if (event?.event === 'payment.captured' && payment?.order_id && payment?.id) {
      const userId = payment?.notes?.userId || payment?.notes?.user_id;
      const titleId = payment?.notes?.titleId || payment?.notes?.title_id;
      await db.from('sv_payments').upsert({
        user_id: userId || null,
        title_id: titleId || null,
        provider_order_id: payment.order_id,
        provider_payment_id: payment.id,
        status: 'verified',
        verified_at: new Date().toISOString(),
        idempotency_key: `${payment.order_id}:${payment.id}`,
      }, { onConflict: 'idempotency_key' });
    }

    await db.from('sv_payment_webhook_events').update({
      processed_at: new Date().toISOString(),
    }).eq('provider_event_id', providerEventId);

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Webhook failed closed' });
  }
}
