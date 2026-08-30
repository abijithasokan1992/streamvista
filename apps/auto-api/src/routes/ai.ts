import { Router } from 'express';
import crypto from 'crypto';
import { getDbClient } from '../config/db';

const router = Router();

const INSTANT_TOOLS = new Set([
  'logline', 'synopsis', 'shorts-script', 'metadata', 'title-enrichment',
  'buyer-match', 'caption', 'screenplay',
]);
const HEAVY_TOOLS = new Set([
  'dubbing', 'voice', 'subtitles', 'translation', 'audio-cleanup', 'upscale',
  'hdr', '2d-to-3d', 'anime-cartoon', 'qc', 'delivery-package',
]);

const DAILY_INSTANT_LIMIT = Number(process.env.AI_DAILY_INSTANT_LIMIT || 5);
const GATEWAY_URL = (process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1').replace(/\/$/, '');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required in production`);
  return value;
}

async function callGateway(tool: string, prompt: string, input: Record<string, unknown>) {
  const apiKey = requireEnv('AI_GATEWAY_API_KEY');
  const model = requireEnv('AI_MODEL');
  const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are the Crayons Pictures production AI. Perform the requested ${tool} operation. Return useful production-ready text only, without fabricated facts.`,
        },
        { role: 'user', content: `${prompt}\n\nStructured input:\n${JSON.stringify(input)}` },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI provider request failed (${response.status}): ${body.slice(0, 500)}`);
  }
  const payload: any = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('AI provider returned no usable output');
  return { text: text.trim(), model, provider: 'vercel-ai-gateway' };
}

async function createJob(userId: string, tool: string, projectId: string | null, assetId: string | null, input: Record<string, unknown>, provider: string | null) {
  const jobId = crypto.randomUUID();
  const { data, error } = await getDbClient().from('ai_jobs').insert({
    id: jobId,
    project_id: projectId,
    asset_id: assetId,
    tool,
    provider,
    status: 'queued',
    progress: 0,
    input,
    created_by: userId,
  }).select('*').single();
  if (error) throw new Error(`AI job creation failed: ${error.message}`);
  return data;
}

router.get('/tools', (_req, res) => {
  res.json({
    tools: [
      ...Array.from(INSTANT_TOOLS).map((id) => ({ id, mode: 'instant' })),
      ...Array.from(HEAVY_TOOLS).map((id) => ({ id, mode: 'job' })),
    ],
  });
});

router.post('/jobs', async (req: any, res) => {
  try {
    const { tool, projectId = null, assetId = null, input = {}, provider = null } = req.body || {};
    if (!HEAVY_TOOLS.has(tool)) return res.status(400).json({ error: 'Unsupported or non-job AI tool' });
    const job = await createJob(req.user.userId, tool, projectId, assetId, input, provider);
    return res.status(202).json({ job });
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'AI job unavailable' });
  }
});

router.get('/jobs/:id', async (req: any, res) => {
  const { data, error } = await getDbClient().from('ai_jobs').select('*').eq('id', req.params.id).maybeSingle();
  if (error) return res.status(503).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'AI job not found' });
  if (data.created_by !== req.user.userId && !['founder', 'super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  return res.json({ job: data });
});

router.post('/generate', async (req: any, res) => {
  const { tool, prompt = '', input = {} } = req.body || {};
  if (!INSTANT_TOOLS.has(tool)) return res.status(400).json({ error: 'Unsupported instant AI tool' });
  if (!String(prompt).trim()) return res.status(400).json({ error: 'prompt is required' });

  const db = getDbClient();
  const today = new Date().toISOString().slice(0, 10);
  const { count, error: usageError } = await db
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.userId)
    .eq('usage_date', today)
    .eq('kind', 'instant_generation');
  if (usageError) return res.status(503).json({ error: usageError.message });
  if ((count || 0) >= DAILY_INSTANT_LIMIT) {
    return res.status(429).json({ error: 'Daily AI allowance reached', limit: DAILY_INSTANT_LIMIT, remaining: 0 });
  }

  let job: any;
  try {
    job = await createJob(req.user.userId, tool, input.projectId || null, input.assetId || null, input, 'vercel-ai-gateway');
    await db.from('ai_jobs').update({ status: 'running', progress: 10, started_at: new Date().toISOString() }).eq('id', job.id);

    const result = await callGateway(tool, prompt, input);
    const { data: completed, error } = await db.from('ai_jobs').update({
      status: 'completed',
      progress: 100,
      provider: result.provider,
      output: { text: result.text, model: result.model },
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', job.id).select('*').single();
    if (error) throw new Error(error.message);

    const { error: ledgerError } = await db.from('ai_usage').insert({
      user_id: req.user.userId,
      usage_date: today,
      kind: 'instant_generation',
      job_id: job.id,
      tool,
    });
    if (ledgerError) throw new Error(`AI usage ledger failed: ${ledgerError.message}`);

    return res.json({ success: true, job: completed, output: result.text, remaining: Math.max(0, DAILY_INSTANT_LIMIT - ((count || 0) + 1)) });
  } catch (err: any) {
    if (job?.id) await db.from('ai_jobs').update({ status: 'failed', error: err.message, updated_at: new Date().toISOString() }).eq('id', job.id);
    return res.status(503).json({ error: err.message || 'AI generation failed' });
  }
});

export default router;
