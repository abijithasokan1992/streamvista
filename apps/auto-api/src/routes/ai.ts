import { Router } from 'express';
import { runAI, AICapability } from '../services/AIProviderGateway';

const router = Router();

const capabilities: Record<string, AICapability> = {
  identifyPart: 'chat',
  enhanceSearch: 'chat',
  parseVin: 'chat',
  chat: 'chat',
  logline: 'logline',
  synopsis: 'synopsis',
  scriptOptimizer: 'script_optimizer',
  shortsScript: 'shorts_script',
  buyerMatchmaker: 'buyer_matchmaker',
};

router.post('/run', async (req: any, res: any) => {
  try {
    const { capability, prompt, system, provider, model, maxTokens } = req.body || {};
    if (!capability || !prompt) return res.status(400).json({ success: false, error: 'capability and prompt are required' });
    if (!Object.values(capabilities).includes(capability)) return res.status(400).json({ success: false, error: 'unsupported capability' });
    const result = await runAI({ capability, prompt, system, provider, model, maxTokens });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    const code = err?.code || 'provider_request_failed';
    const status = code === 'provider_not_configured' ? 503 : Math.min(599, Math.max(400, Number(err?.statusCode || 502)));
    return res.status(status).json({ success: false, error: code, message: err?.message || 'AI execution failed' });
  }
});

router.post('/logline', async (req: any, res: any) => {
  req.body = { ...req.body, capability: 'logline' };
  return router.handle(req, res, () => undefined);
});

router.post('/synopsis', async (req: any, res: any) => {
  req.body = { ...req.body, capability: 'synopsis' };
  return router.handle(req, res, () => undefined);
});

router.post('/script-optimizer', async (req: any, res: any) => {
  req.body = { ...req.body, capability: 'script_optimizer' };
  return router.handle(req, res, () => undefined);
});

router.post('/shorts-script', async (req: any, res: any) => {
  req.body = { ...req.body, capability: 'shorts_script' };
  return router.handle(req, res, () => undefined);
});

export default router;
