import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { paymentService } from '../../services/paymentService';

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { orderId, paymentId, signature, titleId, dealId } = req.body || {};
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!orderId || !paymentId || !signature || !userId) {
      return res.status(400).json({ error: 'Missing verification parameters' });
    }
    if (!paymentService.verifySignature(orderId, paymentId, signature)) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
    const idempotencyKey = `${orderId}:${paymentId}`;
    const db = admin();
    const { data: existing } = await db.from('sv_payments').select('id,status').eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing) return res.json({ success: true, duplicate: true, payment: existing });
    const row = {
      user_id: userId,
      title_id: titleId || null,
      deal_id: dealId || null,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      status: 'verified',
      verified_at: new Date().toISOString(),
      idempotency_key: idempotencyKey,
    };
    const { data, error } = await db.from('sv_payments').insert(row).select('id,status,verified_at').single();
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, payment: data });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Verify failed closed' });
  }
}
