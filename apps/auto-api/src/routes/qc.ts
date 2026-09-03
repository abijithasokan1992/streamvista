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

router.post('/trigger', async (req: any, res) => {
  if (!featureFlags().qcTriggerEnabled) {
    return fail(res, req, 503, { code: 'FEATURE_DISABLED', message: 'QC trigger is currently unavailable.' });
  }
  const userId = String(req.user?.userId || req.user?.id || '').trim();
  const role = String(req.user?.role || '').trim().toLowerCase();
  if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Secure session required.' });

  const titleId = String(req.body?.titleId || req.body?.assetId || '').trim();
  if (!UUID_RE.test(titleId)) return fail(res, req, 400, { code: 'INVALID_TITLE_ID', message: 'A valid titleId is required.' });

  try {
    const db = admin();
    const { data: title, error: titleError } = await db
      .from('sv_app_titles')
      .select('id,creator_id,metadata')
      .eq('id', titleId)
      .maybeSingle();
    if (titleError) return fail(res, req, 503, { code: 'TITLE_LOOKUP_FAILED', message: 'Could not verify title.' });
    if (!title) return fail(res, req, 404, { code: 'TITLE_NOT_FOUND', message: 'Title not found.' });
    const adminRole = role === 'admin' || role === 'super_admin' || role === 'qc';
    if (title.creator_id !== userId && !adminRole) {
      return fail(res, req, 403, { code: 'TITLE_FORBIDDEN', message: 'You are not authorized to trigger QC for this title.' });
    }

    const now = new Date().toISOString();
    const metadata = { ...(title.metadata || {}), qc_status: 'PROCESSING', qc_triggered_at: now, qc_triggered_by: userId };
    const { error: updateError } = await db.from('sv_app_titles').update({ metadata, status: 'qc', updated_at: now }).eq('id', titleId);
    if (updateError) return fail(res, req, 503, { code: 'QC_PERSIST_FAILED', message: 'Could not queue QC processing.' });

    return ok(res, req, {
      result: {
        assetId: titleId,
        passed: false,
        bitrateStable: false,
        frameDrops: null,
        state: 'PROCESSING',
        timestamp: now,
      },
    }, 202);
  } catch {
    return fail(res, req, 503, { code: 'QC_UNAVAILABLE', message: 'QC service is currently unavailable.' });
  }
});

export default router;
