import { Router } from 'express';
import { SupabasePaymentService } from '../services/SupabasePaymentService';

const router = Router();

router.get('/', async (req: any, res) => {
  if (!req.user?.userId) return res.status(401).json({ error: 'Authenticated user required' });
  try {
    const rows = await SupabasePaymentService.getUserRevenue(req.user.userId);
    const gross = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    res.json({ success: true, currency: rows[0]?.currency || 'INR', grossRevenue: gross, transactions: rows });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Revenue query failed' });
  }
});

export default router;
