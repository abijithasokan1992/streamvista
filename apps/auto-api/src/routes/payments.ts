import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';

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

async function issueEntitlement(db: any, paymentId: string) {
  const { data: payment, error } = await db
    .from('sv_payments')
    .select('id,user_id,title_id,deal_id,status')
    .eq('id', paymentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!payment || !['verified', 'captured', 'authorized'].includes(payment.status) || !payment.user_id) return null;

  const { data, error: entitlementError } = await db
    .from('entitlements')
    .upsert({
      user_id: payment.user_id,
      title_id: payment.title_id,
      deal_id: payment.deal_id,
      payment_id: payment.id,
      entitlement_type: 'title-license',
      status: 'active',
    }, { onConflict: 'user_id,payment_id,entitlement_type' })
    .select('*')
    .single();
  if (entitlementError) throw new Error(entitlementError.message);
  return data;
}

router.post('/create-order', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const titleId = String(req.body?.titleId || req.body?.assetId || '').trim();
    const idempotencyKey = String(req.headers['idempotency-key'] || req.body?.idempotencyKey || '').trim();
    if (!userId) return res.status(401).json({ error: 'Session required' });
    if (!titleId) return res.status(400).json({ error: 'titleId is required' });
    if (!idempotencyKey) return res.status(400).json({ error: 'Idempotency-Key header is required' });

    const db = admin();
    const { data: title, error: titleError } = await db
      .from('sv_app_titles')
      .select('id,creator_id,commercial_profile,status')
      .eq('id', titleId)
      .maybeSingle();
    if (titleError) return res.status(503).json({ error: titleError.message });
    if (!title) return res.status(404).json({ error: 'Title not found' });
    if (!['approved', 'ready_for_distribution'].includes(title.status)) return res.status(409).json({ error: 'Title is not commercially available' });

    const { data: existing } = await db.from('sv_payments')
      .select('id,status,provider_order_id,amount,currency')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing?.provider_order_id) return res.json({ success: true, duplicate: true, order: { id: existing.provider_order_id }, payment: existing });

    const commercial = title.commercial_profile && typeof title.commercial_profile === 'object' ? title.commercial_profile as Record<string, unknown> : {};
    const configuredPrice = Number(commercial.price ?? commercial.amount ?? 0);
    if (!Number.isFinite(configuredPrice) || configuredPrice <= 0) return res.status(409).json({ error: 'Commercial price is not configured for this title' });

    const amountInPaise = Math.round(configuredPrice * 100);
    const order = await PaymentService.createRazorpayOrder(amountInPaise, 'INR', `sv_${idempotencyKey}`.slice(0, 40));
    const { data: payment, error } = await db.from('sv_payments').insert({
      user_id: userId,
      title_id: titleId,
      provider_order_id: order.id,
      amount: configuredPrice,
      currency: 'INR',
      purpose: 'streamvista',
      status: 'created',
      idempotency_key: idempotencyKey,
    }).select('id,status,provider_order_id,amount,currency').single();
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, order, payment });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Payment order failed closed' });
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
    if (!PaymentService.verifySignature(finalOrderId, finalPaymentId, finalSignature)) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const db = admin();
    const { data: existing, error: existingError } = await db
      .from('sv_payments')
      .select('id,user_id,title_id,deal_id,status')
      .eq('provider_order_id', finalOrderId)
      .eq('user_id', userId)
      .maybeSingle();
    if (existingError) return res.status(503).json({ error: existingError.message });
    if (!existing) return res.status(404).json({ error: 'Payment order not found' });

    const patch = {
      provider_payment_id: finalPaymentId,
      status: 'verified',
      verified_at: new Date().toISOString(),
      title_id: titleId || existing.title_id,
      deal_id: dealId || existing.deal_id,
      idempotency_key: `${finalOrderId}:${finalPaymentId}`,
    };
    const { data, error } = await db.from('sv_payments').update(patch).eq('id', existing.id).select('id,status,verified_at,provider_order_id,provider_payment_id').single();
    if (error) return res.status(503).json({ error: error.message });
    const entitlement = await issueEntitlement(db, existing.id);
    return res.json({ success: true, payment: data, entitlement });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Payment verification failed closed' });
  }
});

router.post('/webhook', async (req: any, res) => {
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : null;
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
      const { data: updated, error: updateError } = await db.from('sv_payments').update({
        provider_payment_id: payment.id,
        status: 'captured',
        verified_at: new Date().toISOString(),
        amount: Number(payment.amount || 0) / 100,
        currency: payment.currency || 'INR',
      }).eq('provider_order_id', payment.order_id).select('id').maybeSingle();
      if (updateError) throw new Error(updateError.message);
      if (updated?.id) await issueEntitlement(db, updated.id);
    }

    await db.from('sv_payment_webhook_events').update({ processed_at: new Date().toISOString(), status: 'processed' }).eq('event_id', eventId);
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Webhook failed closed' });
  }
});

router.get('/revenue', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    if (!userId) return res.status(401).json({ error: 'Session required' });
    const db = admin();
    const { data, error } = await db.from('sv_payments').select('id,title_id,deal_id,status,verified_at,provider_payment_id,amount,currency').eq('user_id', userId).in('status', ['captured', 'authorized', 'verified']);
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, payments: data || [], count: data?.length || 0 });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Revenue list failed closed' });
  }
});

export default router;
