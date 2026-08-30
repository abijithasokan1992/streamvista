import { Router } from 'express';
import { trackEvent } from '../services/AnalyticsService';

const router = Router();

router.post('/track', async (req: any, res: any) => {
  const event = typeof req.body?.event === 'string' ? req.body.event.trim() : '';
  if (!event || event.length > 120) return res.status(400).json({ success: false, error: 'invalid event' });
  const distinctId = String(req.user?.sub || req.user?.id || '').trim();
  if (!distinctId) return res.status(401).json({ success: false, error: 'user identity missing' });

  try {
    await trackEvent(event, distinctId, req.body?.properties || {});
    return res.json({ success: true });
  } catch (err) {
    console.error('Analytics tracking failed', err);
    return res.status(502).json({ success: false, error: 'analytics_failed' });
  }
});

export default router;
