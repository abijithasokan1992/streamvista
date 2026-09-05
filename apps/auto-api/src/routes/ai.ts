import { Router } from 'express';
import { runAI, AICapability } from '../services/AIProviderGateway';
import { getStudioCapabilities } from '../config/aiCapabilities';

const router = Router();

const validCapabilities = new Set<AICapability>([
  'chat',
  'logline',
  'synopsis',
  'script_optimizer',
  'shorts_script',
  'buyer_matchmaker',
]);

router.get('/capabilities', (_req, res) => {
  return res.json({ success: true, capabilities: getStudioCapabilities() });
});

router.post('/run', async (req: any, res: any) => {
  try {
    const capability = req.body?.capability as AICapability;
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!capability || !validCapabilities.has(capability)) {
      return res.status(400).json({ success: false, error: 'Invalid AI capability' });
    }
    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });
    const result = await runAI({
      capability,
      prompt,
      system: req.body?.system,
      provider: req.body?.provider,
      model: req.body?.model,
      maxTokens: req.body?.maxTokens,
    });
    return res.json({ success: true, result });
  } catch (error: any) {
    const status = error?.code === 'provider_not_configured' ? 503 : 502;
    return res.status(status).json({ success: false, error: error?.message || 'AI request failed', code: error?.code || 'provider_request_failed' });
  }
});

const routeMap: Record<string, AICapability> = {
  '/chat': 'chat',
  '/logline': 'logline',
  '/synopsis': 'synopsis',
  '/script-optimizer': 'script_optimizer',
  '/shorts-script': 'shorts_script',
  '/buyer-matchmaker': 'buyer_matchmaker',
};

for (const [path, capability] of Object.entries(routeMap)) {
  router.post(path, async (req: any, res: any) => {
    try {
      const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
      if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });
      const result = await runAI({
        capability,
        prompt,
        system: req.body?.system,
        provider: req.body?.provider,
        model: req.body?.model,
        maxTokens: req.body?.maxTokens,
      });
      return res.json({ success: true, result });
    } catch (error: any) {
      const status = error?.code === 'provider_not_configured' ? 503 : 502;
      return res.status(status).json({ success: false, error: error?.message || 'AI request failed', code: error?.code || 'provider_request_failed' });
    }
  });
}

export default router;
