import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requiredEnv, requiredUrlEnv } from '../config/env';
import { fail, ok } from '../lib/http';
import { featureFlags } from '../lib/features';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function admin() {
  return createClient(requiredUrlEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

router.post('/create-deal', async (req: any, res) => {
  if (!featureFlags().marketplaceDealEnabled) {
    return fail(res, req, 503, { code: 'FEATURE_DISABLED', message: 'Marketplace deal creation is currently unavailable.' });
  }
  const userId = String(req.user?.userId || req.user?.id || '').trim();
  const role = String(req.user?.role || '').trim().toLowerCase();
  if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Secure session required.' });
  if (role !== 'buyer' && role !== 'admin' && role !== 'super_admin') {
    return fail(res, req, 403, { code: 'ROLE_FORBIDDEN', message: 'Only buyer accounts can create licensing deals.' });
  }

  const titleId = String(req.body?.titleId || '').trim();
  if (!UUID_RE.test(titleId)) {
    return fail(res, req, 400, { code: 'INVALID_TITLE_ID', message: 'A valid titleId is required.' });
  }

  try {
    const db = admin();
    const { data: title, error: titleError } = await db
      .from('sv_app_titles')
      .select('id,creator_id,status,commercial_profile')
      .eq('id', titleId)
      .maybeSingle();
    if (titleError) return fail(res, req, 503, { code: 'TITLE_LOOKUP_FAILED', message: 'Could not verify title availability.' });
    if (!title) return fail(res, req, 404, { code: 'TITLE_NOT_FOUND', message: 'Title not found.' });
    if (!['approved', 'ready_for_distribution'].includes(String(title.status || ''))) {
      return fail(res, req, 409, { code: 'TITLE_NOT_LICENSABLE', message: 'This title is not currently licensable.' });
    }

    const price = Number((title.commercial_profile as any)?.price ?? (title.commercial_profile as any)?.license_price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return fail(res, req, 409, { code: 'TITLE_PRICE_UNAVAILABLE', message: 'This title is not commercially priced yet.' });
    }

    const { data: existing } = await db
      .from('sv_marketplace_deals')
      .select('id,status,payment_status,contract_status,price,created_at')
      .eq('buyer_id', userId)
      .eq('title_id', titleId)
      .in('status', ['requested', 'under_review', 'countered', 'accepted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return ok(res, req, { deal: existing, duplicate: true });

    const { data: deal, error: dealError } = await db
      .from('sv_marketplace_deals')
      .insert({
        buyer_id: userId,
        seller_id: title.creator_id,
        title_id: titleId,
        status: 'requested',
        contract_status: 'pending',
        payment_status: 'unpaid',
        price,
      })
      .select('id,status,payment_status,contract_status,price,created_at')
      .single();
    if (dealError) return fail(res, req, 503, { code: 'DEAL_CREATE_FAILED', message: 'Could not create licensing deal.' });

    return ok(res, req, { deal }, 201);
  } catch {
    return fail(res, req, 503, { code: 'DEAL_SERVICE_UNAVAILABLE', message: 'Marketplace service is currently unavailable.' });
  }
});

export default router;
