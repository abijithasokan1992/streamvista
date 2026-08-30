import { Router } from 'express';
import { generateWithOpenRouter, OpenRouterMessage } from '../services/OpenRouterService';

const router = Router();

const disabled = (feature: string) => (_req: any, res: any) => {
  res.status(410).json({
    success: false,
    error: `${feature} is disabled in the production baseline.`,
  });
};

router.post('/chat', async (req: any, res: any) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ success: false, error: 'message is required' });
  }
  if (message.length > 20_000) {
    return res.status(413).json({ success: false, error: 'message is too large' });
  }

  try {
    const result = await generateWithOpenRouter([
      {
        role: 'system',
        content: 'You are StreamVista AI. Answer accurately, concisely, and do not claim access to data or actions you cannot verify.',
      },
      { role: 'user', content: message },
    ]);

    return res.json({ success: true, ...result });
  } catch (error: any) {
    if (error?.code === 'OPENROUTER_NOT_CONFIGURED') {
      return res.status(503).json({ success: false, error: 'AI service is not configured' });
    }
    if (error?.code === 'OPENROUTER_EMPTY_RESPONSE') {
      return res.status(502).json({ success: false, error: 'AI provider returned no content' });
    }
    return res.status(502).json({ success: false, error: 'AI provider request failed' });
  }
});

router.post('/identify-part', disabled('Gemini automotive image identification'));
router.post('/enhance-search', disabled('Gemini search enhancement'));
router.post('/parse-vin', disabled('Gemini VIN parsing'));

export default router;
