import { Router } from 'express';
import { getOpenFeatureClient } from '../lib/openfeature';

const router = Router();

router.get('/', async (req, res) => {
  const flagKey = String(req.query.key || '').trim();
  if (!flagKey) return res.status(400).json({ error: 'Flag key is required' });

  try {
    const client = await getOpenFeatureClient();
    const targetingKey = String(req.query.userId || 'anonymous').trim() || 'anonymous';
    const plan = String(req.query.plan || '').trim() || undefined;

    const details = await client.getBooleanDetails(flagKey, false, {
      targetingKey,
      user: {
        id: targetingKey,
        ...(plan ? { plan } : {}),
      },
    });

    return res.json({
      key: flagKey,
      value: details.value,
      reason: details.reason,
      errorCode: details.errorCode,
      errorMessage: details.errorMessage,
    });
  } catch (error: any) {
    console.error('Vercel Flags evaluation failed:', error);
    return res.status(503).json({
      key: flagKey,
      value: false,
      reason: 'ERROR',
      errorMessage: 'Feature flag evaluation unavailable',
    });
  }
});

export default router;
