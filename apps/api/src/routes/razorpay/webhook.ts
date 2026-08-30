import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { paymentService } from '../../services/paymentService';

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function razorpayWebhook(req: Request, res: Response) {
  try {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (!signature || !paymentService.verifyWebhook(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const eventId = event?.id || event?.payload?.payment?.entity?.id;
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });
    const db = admin();
    const { data: seen } = await db.from('sv_payment_webhook_events').select('id').eq('idempotency_key', eventId).maybeSingle();
    if (seen) return res.status(200).json({ ok: true, duplicate: true });
    const { error: logError } = await db.from('sv_payment_webhook_events').insert({
      idempotency_key: eventId,
      event_type: event?.event || 'unknown',
      payload: event,
    });
    if (logError) return res.status(503).json({ error: logError.message });
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Webhook failed closed' });
  }
}
