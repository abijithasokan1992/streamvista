import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { runAI, AICapability } from '../services/AIProviderGateway';

const router = Router();

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const TEXT_CAPABILITIES = new Set<AICapability>([
  'chat',
  'logline',
  'synopsis',
  'script_optimizer',
  'shorts_script',
  'buyer_matchmaker',
]);

router.post('/', async (req: any, res: any) => {
  const userId = req.user?.userId || req.user?.id;
  const capability = req.body?.capability as AICapability;
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';

  if (!userId) return res.status(401).json({ success: false, error: 'Session required' });
  if (!capability || !prompt) return res.status(400).json({ success: false, error: 'capability and prompt are required' });
  if (!TEXT_CAPABILITIES.has(capability)) {
    return res.status(409).json({
      success: false,
      error: 'Capability is not enabled for this production runtime',
      code: 'capability_unavailable',
    });
  }

  try {
    const client = db();
    const now = new Date().toISOString();
    const parameters = req.body?.parameters && typeof req.body.parameters === 'object' ? req.body.parameters : {};
    const { data: job, error: createError } = await client
      .from('ai_runs')
      .insert({
        workspace_id: req.user?.workspace || null,
        project_id: req.body?.projectId || null,
        user_id: userId,
        department: req.body?.department || 'ai_studio',
        agent: capability,
        status: 'queued',
        tool_key: capability,
        instruction: prompt,
        input_text: prompt,
        parameters,
        input_assets: Array.isArray(req.body?.inputAssetIds) ? req.body.inputAssetIds : [],
        approval_required: Boolean(req.body?.approvalRequired),
        created_at: now,
      })
      .select('id,status,created_at')
      .single();

    if (createError) return res.status(503).json({ success: false, error: createError.message, code: 'job_persist_failed' });

    await client.from('ai_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', job.id).eq('user_id', userId);

    try {
      const result = await runAI({
        capability,
        prompt,
        system: req.body?.system,
        provider: req.body?.provider,
        model: req.body?.model,
        maxTokens: req.body?.maxTokens,
      });

      const completedAt = new Date().toISOString();
      const { error: outputError } = await client.from('ai_outputs').insert({
        ai_run_id: job.id,
        output: {
          text: result.text,
          capability,
          provider: result.provider,
          model: result.model,
          providerRequestId: result.providerRequestId || null,
        },
        approval_state: 'ai_generated',
      });
      if (outputError) {
        await client.from('ai_runs').update({
          status: 'failed',
          error_code: 'output_persist_failed',
          error_message: outputError.message,
          completed_at: completedAt,
        }).eq('id', job.id).eq('user_id', userId);
        return res.status(503).json({ success: false, error: outputError.message, code: 'output_persist_failed' });
      }

      const { error: updateError } = await client.from('ai_runs').update({
        status: 'completed',
        completed_at: completedAt,
        provider: result.provider,
        model: result.model,
        usage: result.usage || {},
        cost: 0,
        error_code: null,
        error_message: null,
      }).eq('id', job.id).eq('user_id', userId);
      if (updateError) return res.status(503).json({ success: false, error: updateError.message, code: 'job_update_failed' });

      return res.json({
        success: true,
        job: {
          id: job.id,
          status: 'completed',
          capability,
          createdAt: job.created_at,
          completedAt,
          provider: result.provider,
          model: result.model,
          result: result.text,
          usage: result.usage || null,
        },
      });
    } catch (error: any) {
      const failedAt = new Date().toISOString();
      await client.from('ai_runs').update({
        status: 'failed',
        completed_at: failedAt,
        error_code: error?.code || 'provider_request_failed',
        error_message: error?.message || 'AI execution failed',
      }).eq('id', job.id).eq('user_id', userId);
      return res.status(502).json({ success: false, error: error?.message || 'AI execution failed', code: error?.code || 'provider_request_failed', jobId: job.id });
    }
  } catch (error: any) {
    return res.status(503).json({ success: false, error: error?.message || 'AI job creation failed', code: 'job_creation_failed' });
  }
});

router.get('/:id', async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Session required' });
    const { data, error } = await db()
      .from('ai_runs')
      .select('id,status,tool_key,agent,project_id,user_id,provider,model,instruction,input_text,parameters,input_assets,output_asset_ids,usage,cost,approval_required,approved_by,created_at,started_at,completed_at,error_code,error_message')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return res.status(503).json({ success: false, error: error.message });
    if (!data) return res.status(404).json({ success: false, error: 'AI job not found' });

    const { data: output } = await db()
      .from('ai_outputs')
      .select('id,output,output_asset_id,approval_state,version,created_at')
      .eq('ai_run_id', data.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.json({ success: true, job: { ...data, output: output || null } });
  } catch (error: any) {
    return res.status(503).json({ success: false, error: error?.message || 'AI job lookup failed' });
  }
});

export default router;
