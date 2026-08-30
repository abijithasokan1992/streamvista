import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';
import { OrderService } from '../services/OrderService';

const router = Router();

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

function sessionUser(req: any): string | null {
  return req.user?.userId || req.user?.id || null;
}

router.post('/create-order', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const amount = Number(req.body?.amount);
    const titleId = req.body?.titleId || req.body?.assetId;
    const idempotencyKey = String(req.headers['idempotency-key'] || req.body?.idempotencyKey || '').trim();
    if (!userId) return res.status(401).json({ error: 'Session required' });
    if (!Number.isFinite(amount) || amount <= 0 || !titleId) return res.status(400).json({ error: 'amount and titleId are required' });
    if (!idempotencyKey) return res.status(400).json({ error: 'Idempotency-Key header is required' });

    const db = admin();
    const { data: existing } = await db.from('sv_payments')
      .select('id,status,provider_order_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing?.provider_order_id) {
      return res.json({ success: true, duplicate: true, order: { id: existing.provider_order_id }, payment: existing });
    }

    const order = await PaymentService.createRazorpayOrder(amount, 'INR', `sv_${idempotencyKey}`.slice(0, 40));
    const { error } = await db.from('sv_payments').insert({
      user_id: userId,
      title_id: titleId,
      provider_order_id: order.id,
      amount: amount / 100,
      currency: 'INR',
      purpose: 'streamvista',
      status: 'created',
      idempotency_key: idempotencyKey,
    });
    if (error) return res.status(503).json({ error: error.message });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'Payment order failed closed' });
  }
});

router.post('/verify', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId, signature, titleId, dealId } = req.body || {};
    const finalOrderId = razorpay_order_id || orderId;
    const finalPaymentId = razorpay_payment_id || paymentId;
    const finalSignature = razorpay_signature || signature;
    if (!userId) return res.status(401).json({ error: 'Session required' });
    if (!finalOrderId || !finalPaymentId || !finalSignature) return res.status(400).json({ error: 'Missing verification parameters' });
    if (!PaymentService.verifySignature(finalOrderId, finalPaymentId, finalSignature)) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    const db = admin();
    const idempotencyKey = String(req.headers['idempotency-key'] || `${finalOrderId}:${finalPaymentId}`).trim();
    const { data: existing } = await db.from('sv_payments').select('id,status,verified_at').eq('idempotency_key', idempotencyKey).maybeSingle();
    const patch = {
      user_id: userId,
      title_id: titleId || null,
      deal_id: dealId || null,
      provider_order_id: finalOrderId,
      provider_payment_id: finalPaymentId,
      status: 'captured',
      verified_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
    };
    const result = existing
      ? await db.from('sv_payments').update(patch).eq('id', existing.id).select('id,status,verified_at').single()
      : await db.from('sv_payments').insert(patch).select('id,status,verified_at').single();
    if (result.error) return res.status(503).json({ error: result.error.message });
    res.json({ success: true, payment: result.data });
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'Payment verification failed closed' });
  }
});

router.post('/webhook', async (req: any, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : null;
    const signature = String(req.headers['x-razorpay-signature'] || '');
    if (!raw || !signature || !PaymentService.verifyWebhook(raw, signature)) return res.status(400).json({ error: 'Invalid webhook signature' });
    const event = JSON.parse(raw);
    const eventId = String(event?.id || event?.payload?.payment?.entity?.id || '').trim();
    if (!eventId) return res.status(400).json({ error: 'Missing event id' });
    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const db = admin();
    const { data: seen } = await db.from('sv_payment_webhook_events').select('event_id').eq('event_id', eventId).maybeSingle();
    if (seen) return res.status(200).json({ ok: true, duplicate: true });

    const payment = event?.payload?.payment?.entity;
    const { error: logError } = await db.from('sv_payment_webhook_events').insert({
      event_id: eventId,
      provider_event_id: eventId,
      event_name: event?.event || 'unknown',
      payload_hash: payloadHash,
      payment_id: payment?.id || null,
      received_at: new Date().toISOString(),
    });
    if (logError) return res.status(503).json({ error: logError.message });

    if (event?.event === 'payment.captured' && payment?.order_id && payment?.id) {
      const userId = payment?.notes?.userId || payment?.notes?.user_id || null;
      const titleId = payment?.notes?.titleId || payment?.notes?.title_id || null;
      await db.from('sv_payments').upsert({
        user_id: userId,
        title_id: titleId,
        provider_order_id: payment.order_id,
        provider_payment_id: payment.id,
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency || 'INR',
        status: 'captured',
        verified_at: new Date().toISOString(),
        idempotency_key: `${payment.order_id}:${payment.id}`,
      }, { onConflict: 'idempotency_key' });
    }

    await db.from('sv_payment_webhook_events').update({ processed_at: new Date().toISOString(), status: 'processed' }).eq('event_id', eventId);
    res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'Webhook failed closed' });
  }
});

router.get('/revenue', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    if (!userId) return res.status(401).json({ error: 'Session required' });
    const db = admin();
    const { data, error } = await db.from('sv_payments').select('id,title_id,deal_id,status,verified_at,provider_payment_id,amount,currency').eq('user_id', userId).in('status', ['captured', 'authorized', 'verified']);
    if (error) return res.status(503).json({ error: error.message });
    res.json({ success: true, payments: data || [], count: data?.length || 0 });
  } catch (err: any) {
    res.status(503).json({ error: err.message || 'Revenue list failed closed' });
  }
});

// Backward-compatible endpoint retained for existing checkout code.
router.post('/verify-legacy', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    if (!PaymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
    const finalOrderData = { ...orderData, paymentId: razorpay_payment_id };
    const orderId = await OrderService.createOrder(finalOrderData);
    return res.json({ success: true, orderId });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Payment verification failed closed' });
  }
});

export default router;
