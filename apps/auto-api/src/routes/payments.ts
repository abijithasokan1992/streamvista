import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';

const router = Router();

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sessionUser(req: any): string | null { return req.user?.userId || req.user?.id || null; }

const PLAN_AMOUNT_PAISE: Record<string, number> = { creator: 76700, topup: 76700 };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.post('/create-order', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const cycle = String(req.body?.cycle || '').trim().toLowerCase();
    const requestedAmount = Number(req.body?.amount);
    const titleId = req.body?.titleId || req.body?.assetId || null;
    const idempotencyKey = String(req.headers['idempotency-key'] || req.body?.idempotencyKey || '').trim();

    if (!userId) return res.status(401).json({ error: 'Session required' });
    if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) return res.status(400).json({ error: 'A valid Idempotency-Key is required' });

    let amount = 0;
    if (cycle) {
      if (!PLAN_AMOUNT_PAISE[cycle]) return res.status(400).json({ error: 'Unsupported plan' });
      amount = PLAN_AMOUNT_PAISE[cycle];
    } else {
      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) return res.status(400).json({ error: 'Invalid payment amount' });
      amount = Math.round(requestedAmount * 100);
    }

    if (!cycle && !titleId) return res.status(400).json({ error: 'titleId is required for one-time payments' });

    const db = admin();
    const { data: existing, error: existingError } = await db
      .from('sv_payments')
      .select('id,status,provider_order_id,amount,currency,purpose')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existingError) return res.status(503).json({ error: existingError.message });
    if (existing?.provider_order_id) {
      return res.json({
        success: true,
        duplicate: true,
        order: { id: existing.provider_order_id, amount: Math.round(Number(existing.amount || 0) * 100), currency: existing.currency || 'INR' },
        payment: existing,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await PaymentService.createRazorpayOrder(amount, 'INR', `sv_${idempotencyKey}`.slice(0, 40));
    if (Number(order.amount) !== amount) return res.status(502).json({ error: 'Payment provider returned an unexpected amount' });

    const { data: payment, error } = await db.from('sv_payments').insert({
      user_id: userId,
      title_id: UUID_RE.test(String(titleId || '')) ? titleId : null,
      provider_order_id: order.id,
      amount: amount / 100,
      currency: 'INR',
      purpose: cycle ? `plan:${cycle}` : 'streamvista',
      status: 'created',
      idempotency_key: idempotencyKey,
    }).select('id,status,provider_order_id,amount,currency,purpose').single();
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, order: { id: order.id, amount: Number(order.amount), currency: order.currency || 'INR' }, payment, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Payment order failed closed' });
  }
});

router.post('/verify', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId, signature, titleId, dealId, cycle } = req.body || {};
    const finalOrderId = razorpay_order_id || orderId;
    const finalPaymentId = razorpay_payment_id || paymentId;
    const finalSignature = razorpay_signature || signature;
    if (!userId) return res.status(401).json({ error: 'Session required' });
    if (!finalOrderId || !finalPaymentId || !finalSignature) return res.status(400).json({ error: 'Missing verification parameters' });
    if (!PaymentService.verifySignature(finalOrderId, finalPaymentId, finalSignature)) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const providerAmount = await PaymentService.getOrderAmount(finalOrderId);
    const db = admin();
    const { data: existing, error: existingError } = await db.from('sv_payments').select('id,status,user_id,amount,currency').eq('provider_order_id', finalOrderId).maybeSingle();
    if (existingError) return res.status(503).json({ error: existingError.message });
    if (existing?.user_id && existing.user_id !== userId) return res.status(403).json({ error: 'Payment does not belong to session' });
    if (existing?.amount != null && Math.round(Number(existing.amount) * 100) !== Number(providerAmount)) return res.status(409).json({ error: 'Payment amount mismatch' });

    const idempotencyKey = String(req.headers['idempotency-key'] || `${finalOrderId}:${finalPaymentId}`).trim();
    const patch: Record<string, unknown> = { user_id: userId, deal_id: dealId || null, provider_order_id: finalOrderId, provider_payment_id: finalPaymentId, amount: Number(providerAmount) / 100, currency: 'INR', purpose: cycle ? `plan:${cycle}` : 'streamvista', status: 'captured', verified_at: new Date().toISOString(), idempotency_key: idempotencyKey };
    if (UUID_RE.test(String(titleId || ''))) patch.title_id = titleId;

    const result = existing
      ? await db.from('sv_payments').update(patch).eq('id', existing.id).select('id,status,verified_at,provider_payment_id,amount,currency').single()
      : await db.from('sv_payments').insert(patch).select('id,status,verified_at,provider_payment_id,amount,currency').single();
    if (result.error) return res.status(503).json({ error: result.error.message });
    return res.json({ success: true, verified: true, payment: result.data });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Payment verification failed closed' });
  }
});

router.post('/webhook', async (req: any, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : '';
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (!raw || !signature || !PaymentService.verifyWebhook(raw, signature)) return res.status(400).json({ error: 'Invalid webhook signature' });
    const event = JSON.parse(raw);
    const eventId = String(event?.id || '').trim();
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });
    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const db = admin();
    const { data: seen } = await db.from('sv_payment_webhook_events').select('event_id').eq('event_id', eventId).maybeSingle();
    if (seen) return res.status(200).json({ ok: true, duplicate: true });
    const payment = event?.payload?.payment?.entity;
    const { error: logError } = await db.from('sv_payment_webhook_events').insert({ event_id: eventId, event_name: event?.event || 'unknown', payload_hash: payloadHash, payment_id: payment?.id || null, received_at: new Date().toISOString(), status: 'received' });
    if (logError) return res.status(503).json({ error: logError.message });
    if (['payment.captured', 'payment.authorized', 'payment.failed'].includes(event?.event) && payment?.order_id && payment?.id) {
      const status = event.event === 'payment.captured' ? 'captured' : event.event === 'payment.authorized' ? 'authorized' : 'failed';
      const { error } = await db.from('sv_payments').update({ provider_payment_id: payment.id, provider_event_id: eventId, status, verified_at: new Date().toISOString(), raw_event_hash: payloadHash }).eq('provider_order_id', payment.order_id).eq('provider', 'razorpay');
      if (error) return res.status(503).json({ error: error.message });
    }
    await db.from('sv_payment_webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('event_id', eventId);
    return res.status(200).json({ ok: true });
  } catch (err: any) { return res.status(503).json({ error: err.message || 'Webhook failed closed' }); }
});

router.get('/revenue', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    if (!userId) return res.status(401).json({ error: 'Session required' });
    const db = admin();
    const { data, error } = await db.from('sv_payments').select('id,title_id,deal_id,purpose,status,verified_at,provider_payment_id,amount,currency').eq('user_id', userId).in('status', ['captured', 'authorized']);
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, payments: data || [], count: data?.length || 0 });
  } catch (err: any) { return res.status(503).json({ error: err.message || 'Revenue list failed closed' }); }
});

export default router;