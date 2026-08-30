import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function listRevenue(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Session required' });
    const db = admin();
    const { data, error } = await db
      .from('sv_payments')
      .select('id,title_id,deal_id,status,verified_at,razorpay_payment_id')
      .eq('user_id', userId)
      .eq('status', 'verified');
    if (error) return res.status(503).json({ error: error.message });
    return res.json({ success: true, payments: data || [], count: data?.length || 0 });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Revenue list failed closed' });
  }
}
