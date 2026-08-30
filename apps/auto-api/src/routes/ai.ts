import { Router } from 'express';
import crypto from 'crypto';
import { getDbClient } from '../config/db';

const router = Router();

const INSTANT_TOOLS = new Set([
  'logline',
  'synopsis',
  'shorts-script',
  'metadata',
  'title-enrichment',
  'buyer-match',
  'caption',
  'screenplay',
]);

const HEAVY_TOOLS = new Set([
  'dubbing',
  'voice',
  'subtitles',
  'translation',
  'audio-cleanup',
  'upscale',
  'hdr',
  '2d-to-3d',
  'anime-cartoon',
  'qc',
  'delivery-package',
]);

router.get('/tools', (_req, res) => {
  res.json({
    tools: [
      ...Array.from(INSTANT_TOOLS).map((id) => ({ id, mode: 'instant' })),
      ...Array.from(HEAVY_TOOLS).map((id) => ({ id, mode: 'job' })),
    ],
  });
});

router.post('/jobs', async (req: any, res) => {
  const { tool, projectId = null, assetId = null, input = {}, provider = null } = req.body || {};
  if (!HEAVY_TOOLS.has(tool)) return res.status(400).json({ error: 'Unsupported or non-job AI tool' });

  const jobId = crypto.randomUUID();
  const db = getDbClient();
  const { data, error } = await db
    .from('ai_jobs')
    .insert({
      id: jobId,
      project_id: projectId,
      asset_id: assetId,
      tool,
      provider,
      status: 'queued',
      progress: 0,
      input,
      created_by: req.user.userId,
    })
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: `AI job creation failed: ${error.message}` });
  }

  return res.status(202).json({ job: data });
});

router.get('/jobs/:id', async (req: any, res) => {
  const db = getDbClient();
  const { data, error } = await db.from('ai_jobs').select('*').eq('id', req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'AI job not found' });
  res.json({ job: data });
});

router.post('/generate', async (req: any, res) => {
  const { tool, prompt = '', input = {}, provider = null } = req.body || {};
  if (!INSTANT_TOOLS.has(tool)) return res.status(400).json({ error: 'Unsupported instant AI tool' });

  // Provider execution is intentionally isolated from the HTTP contract.
  // No fake result is returned. The endpoint fails closed until a configured
  // provider adapter is available in the deployment environment.
  if (!provider) return res.status(503).json({ error: 'AI provider is not configured' });

  return res.status(501).json({ error: 'AI provider adapter is not enabled in this production slice' });
});

export default router;
