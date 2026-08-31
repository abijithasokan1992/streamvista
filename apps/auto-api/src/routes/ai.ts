import { Router } from 'express';
import { runAI, AICapability } from '../services/AIProviderGateway';

const router = Router();
const validCapabilities = new Set<AICapability>([
  'chat', 'logline', 'synopsis', 'script_optimizer', 'shorts_script', 'buyer_matchmaker',
]);

async function execute(req: any, res: any, forcedCapability?: AICapability) {
  try {
    const body = req.body || {};
    const capability = forcedCapability || body.capability;
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!capability || !prompt) return res.status(400).json({ success: false, error: 'capability and prompt are required' });
    if (!validCapabilities.has(capability)) return res.status(400).json({ success: false, error: 'unsupported capability' });
    const result = await runAI({
      capability,
      prompt,
      system: typeof body.system === 'string' ? body.system : undefined,
      provider: body.provider,
      model: typeof body.model === 'string' ? body.model : undefined,
      maxTokens: Number.isFinite(body.maxTokens) ? Math.min(4000, Math.max(64, Math.floor(body.maxTokens))) : 1200,
    });
    return res.json({ success: true, ...result });
  } catch (err: any) {
    const code = err?.code || 'provider_request_failed';
    const status = code === 'provider_not_configured' ? 503 : Math.min(599, Math.max(400, Number(err?.statusCode || 502)));
    return res.status(status).json({ success: false, error: code, message: err?.message || 'AI execution failed' });
  }
}

router.post('/run', (req, res) => execute(req, res));
router.post('/chat', (req, res) => execute(req, res, 'chat'));
router.post('/logline', (req, res) => execute(req, res, 'logline'));
router.post('/synopsis', (req, res) => execute(req, res, 'synopsis'));
router.post('/script-optimizer', (req, res) => execute(req, res, 'script_optimizer'));
router.post('/shorts-script', (req, res) => execute(req, res, 'shorts_script'));
router.post('/buyer-matchmaker', (req, res) => execute(req, res, 'buyer_matchmaker'));

export default router;
