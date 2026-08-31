import { Router } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

function verify(raw: string, signature: string | undefined) {
  const secret = process.env.HOSTINGER_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.post('/', async (req: any, res: any) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const signature = typeof req.headers['x-hostinger-signature'] === 'string'
      ? req.headers['x-hostinger-signature']
      : undefined;
    if (!verify(raw, signature)) return res.status(401).json({ ok: false, error: 'Invalid webhook signature' });

    const payload = JSON.parse(raw);
    const eventId = String(payload?.id || '').trim();
    if (!eventId) return res.status(400).json({ ok: false, error: 'Missing event id' });

    const client = db();
    const { data: existing } = await client
      .from('cps.webhook_events')
      .select('id')
      .eq('provider', 'hostinger')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) return res.status(200).json({ ok: true, duplicate: true });

    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const { error } = await client.from('cps.webhook_events').insert({
      provider: 'hostinger',
      event_id: eventId,
      event_name: String(payload?.event || 'unknown'),
      payload_hash: payloadHash,
      status: 'received',
    });
    if (error) return res.status(503).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(503).json({ ok: false, error: err?.message || 'Webhook processing failed' });
  }
});

export default router;
