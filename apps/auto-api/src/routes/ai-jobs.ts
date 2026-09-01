import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { runAI, AICapability } from '../services/AIProviderGateway';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

router.post('/', async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const capability = req.body?.capability as AICapability;
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!userId) return res.status(401).json({ success: false, error: 'Session required' });
    if (!capability || !prompt) return res.status(400).json({ success: false, error: 'capability and prompt are required' });

    const client = db();
    const { data: job, error: createError } = await client
      .from('cps_ai_runs')
      .insert({
        workspace_id: req.user?.workspace || null,
        project_id: req.body?.projectId || null,
        user_id: userId,
        capability,
        status: 'queued',
        request_json: { prompt, system: req.body?.system || null, provider: req.body?.provider || null, model: req.body?.model || null },
      })
      .select('id,status,created_at')
      .single();

    if (createError) return res.status(503).json({ success: false, error: createError.message });

    void (async () => {
      try {
        await client.from('cps_ai_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', job.id);
        const result = await runAI({ capability, prompt, system: req.body?.system, provider: req.body?.provider, model: req.body?.model, maxTokens: req.body?.maxTokens });
        await client.from('cps_ai_runs').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider: result.provider,
          model: result.model,
          result_json: result,
        }).eq('id', job.id);
      } catch (error: any) {
        await client.from('cps_ai_runs').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_code: error?.code || 'provider_request_failed',
          error_message: error?.message || 'AI execution failed',
        }).eq('id', job.id);
      }
    })();

    return res.status(202).json({ success: true, job: { id: job.id, status: 'queued', createdAt: job.created_at } });
  } catch (error: any) {
    return res.status(503).json({ success: false, error: error?.message || 'AI job creation failed' });
  }
});

router.get('/:id', async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Session required' });
    const { data, error } = await db().from('cps_ai_runs').select('*').eq('id', req.params.id).eq('user_id', userId).maybeSingle();
    if (error) return res.status(503).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: 'AI job not found' });
    return res.json({ success: true, job: data });
  } catch (error: any) {
    return res.status(503).json({ success: false, error: error?.message || 'AI job lookup failed' });
  }
});

export default router;
