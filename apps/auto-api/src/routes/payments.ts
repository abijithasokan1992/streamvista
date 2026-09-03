import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import { PaymentService } from '../services/PaymentService';
import { fail, ok } from '../lib/http';
import { requiredEnv, requiredUrlEnv } from '../config/env';

const router = Router();

function admin() {
  return createClient(requiredUrlEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sessionUser(req: any): string | null { return req.user?.userId || req.user?.id || null; }

const PLAN_AMOUNT_PAISE: Record<string, number> = { creator: 76700, topup: 76700 };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const verifyRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => fail(res, req, 429, { code: 'RATE_LIMITED', message: 'Too many requests. Please retry shortly.' }),
});

router.post('/create-order', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const cycle = String(req.body?.cycle || '').trim().toLowerCase();
    const requestedAmount = Number(req.body?.amount);
    const titleId = req.body?.titleId || req.body?.assetId || null;
    const idempotencyKey = String(req.headers['idempotency-key'] || req.body?.idempotencyKey || '').trim();

    if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Session required.' });
    if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) return fail(res, req, 400, { code: 'IDEMPOTENCY_KEY_INVALID', message: 'A valid Idempotency-Key is required.' });

    let amount = 0;
    if (cycle) {
      if (!PLAN_AMOUNT_PAISE[cycle]) return fail(res, req, 400, { code: 'PLAN_UNSUPPORTED', message: 'Unsupported plan.' });
      amount = PLAN_AMOUNT_PAISE[cycle];
    } else {
      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) return fail(res, req, 400, { code: 'INVALID_AMOUNT', message: 'Invalid payment amount.' });
      amount = Math.round(requestedAmount * 100);
    }

    if (!cycle && !titleId) return fail(res, req, 400, { code: 'TITLE_REQUIRED', message: 'titleId is required for one-time payments.' });

    const db = admin();
    const { data: existing, error: existingError } = await db
      .from('sv_payments')
      .select('id,status,provider_order_id,amount,currency,purpose')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existingError) return fail(res, req, 503, { code: 'PAYMENT_LOOKUP_FAILED', message: 'Payment service unavailable.' });
    if (existing?.provider_order_id) {
      return ok(res, req, {
        duplicate: true,
        order: { id: existing.provider_order_id, amount: Math.round(Number(existing.amount || 0) * 100), currency: existing.currency || 'INR' },
        payment: existing,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await PaymentService.createRazorpayOrder(amount, 'INR', `sv_${idempotencyKey}`.slice(0, 40));
    if (Number(order.amount) !== amount) return fail(res, req, 502, { code: 'PAYMENT_PROVIDER_AMOUNT_MISMATCH', message: 'Payment provider returned an unexpected amount.' });

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
    if (error) return fail(res, req, 503, { code: 'PAYMENT_PERSIST_FAILED', message: 'Payment service unavailable.' });
    return ok(res, req, { order: { id: order.id, amount: Number(order.amount), currency: order.currency || 'INR' }, payment, keyId: process.env.RAZORPAY_KEY_ID });
  } catch {
    return fail(res, req, 503, { code: 'PAYMENT_ORDER_FAILED', message: 'Payment order failed closed.' });
  }
});

router.post('/verify', verifyRateLimit, async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId, signature, titleId, dealId, cycle } = req.body || {};
    const finalOrderId = razorpay_order_id || orderId;
    const finalPaymentId = razorpay_payment_id || paymentId;
    const finalSignature = razorpay_signature || signature;
    if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Session required.' });
    if (!finalOrderId || !finalPaymentId || !finalSignature) return fail(res, req, 400, { code: 'VERIFICATION_FIELDS_REQUIRED', message: 'Missing verification parameters.' });
    if (!PaymentService.verifySignature(finalOrderId, finalPaymentId, finalSignature)) return fail(res, req, 400, { code: 'INVALID_PAYMENT_SIGNATURE', message: 'Invalid payment signature.' });

    const providerAmount = await PaymentService.getOrderAmount(finalOrderId);
    const db = admin();
    const { data: existing, error: existingError } = await db.from('sv_payments').select('id,status,user_id,amount,currency').eq('provider_order_id', finalOrderId).maybeSingle();
    if (existingError) return fail(res, req, 503, { code: 'PAYMENT_LOOKUP_FAILED', message: 'Payment verification unavailable.' });
    if (existing?.user_id && existing.user_id !== userId) return fail(res, req, 403, { code: 'PAYMENT_FORBIDDEN', message: 'Payment does not belong to session.' });
    if (existing?.amount != null && Math.round(Number(existing.amount) * 100) !== Number(providerAmount)) return fail(res, req, 409, { code: 'PAYMENT_AMOUNT_MISMATCH', message: 'Payment amount mismatch.' });

    const idempotencyKey = String(req.headers['idempotency-key'] || `${finalOrderId}:${finalPaymentId}`).trim();
    const patch: Record<string, unknown> = { user_id: userId, deal_id: dealId || null, provider_order_id: finalOrderId, provider_payment_id: finalPaymentId, amount: Number(providerAmount) / 100, currency: 'INR', purpose: cycle ? `plan:${cycle}` : 'streamvista', status: 'captured', verified_at: new Date().toISOString(), idempotency_key: idempotencyKey };
    if (UUID_RE.test(String(titleId || ''))) patch.title_id = titleId;

    const result = existing
      ? await db.from('sv_payments').update(patch).eq('id', existing.id).select('id,status,verified_at,provider_payment_id,amount,currency').single()
      : await db.from('sv_payments').insert(patch).select('id,status,verified_at,provider_payment_id,amount,currency').single();
    if (result.error) return fail(res, req, 503, { code: 'PAYMENT_VERIFY_PERSIST_FAILED', message: 'Payment verification unavailable.' });
    return ok(res, req, { verified: true, payment: result.data });
  } catch {
    return fail(res, req, 503, { code: 'PAYMENT_VERIFY_FAILED', message: 'Payment verification failed closed.' });
  }
});

router.get('/revenue', async (req: any, res) => {
  try {
    const userId = sessionUser(req);
    if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Session required.' });
    const db = admin();
    const { data, error } = await db.from('sv_payments').select('id,title_id,deal_id,purpose,status,verified_at,provider_payment_id,amount,currency').eq('user_id', userId).in('status', ['captured', 'authorized']);
    if (error) return fail(res, req, 503, { code: 'REVENUE_LOOKUP_FAILED', message: 'Revenue list unavailable.' });
    return ok(res, req, { payments: data || [], count: data?.length || 0 });
  } catch {
    return fail(res, req, 503, { code: 'REVENUE_LIST_FAILED', message: 'Revenue list failed closed.' });
  }
});

export default router;