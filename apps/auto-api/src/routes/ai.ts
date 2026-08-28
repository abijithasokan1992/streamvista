import { Router } from 'express';

const router = Router();

const disabled = (feature: string) => (_req: any, res: any) => {
  res.status(410).json({
    success: false,
    error: `${feature} is disabled in the production baseline.`,
  });
};

router.post('/identify-part', disabled('Gemini automotive image identification'));
router.post('/enhance-search', disabled('Gemini search enhancement'));
router.post('/parse-vin', disabled('Gemini VIN parsing'));

export default router;
