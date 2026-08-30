import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { paymentService } from '../../services/paymentService';

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function createOrder(req: Request, res: Response) {
  try {
    const amount = Number((req.body as any)?.amount);
    const titleId = (req.body as any)?.titleId || (req.body as any)?.assetId;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const idempotencyKey =
      String(req.headers['idempotency-key'] || (req.body as any)?.idempotencyKey || '').trim();
    if (!amount || amount <= 0 || !titleId || !userId) {
      return res.status(400).json({ error: 'amount, titleId and session are required' });
    }
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency-Key header is required' });
    }
    const db = admin();
    const { data: existing } = await db
      .from('sv_payments')
      .select('id,status,razorpay_order_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing?.razorpay_order_id) {
      return res.json({ success: true, duplicate: true, order: { id: existing.razorpay_order_id }, payment: existing });
    }
    const order = await paymentService.createOrder(amount, 'INR', `sv_${idempotencyKey}`.slice(0, 40));
    const { error } = await db.from('sv_payments').insert({
      user_id: userId,
      title_id: titleId,
      razorpay_order_id: order.id,
      status: 'created',
      idempotency_key: idempotencyKey,
    });
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Order create failed closed' });
  }
}
