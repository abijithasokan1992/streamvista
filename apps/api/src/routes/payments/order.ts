import { Request, Response } from 'express';
import { paymentService } from '../../services/paymentService';

export async function createOrder(req: Request, res: Response) {
  try {
    const amount = Number((req.body as any)?.amount);
    const titleId = (req.body as any)?.titleId || (req.body as any)?.assetId;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!amount || amount <= 0 || !titleId || !userId) {
      return res.status(400).json({ error: 'amount, titleId and session are required' });
    }
    const order = await paymentService.createOrder(amount, 'INR', `sv_${userId}_${titleId}_${Date.now()}`);
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(503).json({ error: error.message || 'Order create failed closed' });
  }
}
