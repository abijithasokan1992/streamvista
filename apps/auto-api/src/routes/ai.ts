import { Router } from 'express';
import multer from 'multer';
import { GeminiService } from '../services/GeminiService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/identify-part', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const result = await GeminiService.identifyPartFromImage(req.file.buffer, req.file.mimetype);
    res.json(JSON.parse(result.replace(/```json|```/g, "")));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/enhance-search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await GeminiService.enhanceSearchQuery(query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/parse-vin', async (req, res) => {
  try {
    const { vin } = req.body;
    const result = await GeminiService.parseVin(vin);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
