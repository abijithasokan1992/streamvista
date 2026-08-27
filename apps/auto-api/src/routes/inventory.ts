import { Router } from 'express';
import { InventoryService } from '../services/InventoryService';

const router = Router();

router.get('/product/:productId', async (req, res) => {
  try {
    const inventory = await InventoryService.getInventoryByProduct(Number(req.params.productId));
    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
    const alerts = await InventoryService.getLowStockAlerts(threshold);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { inventoryId, quantity, movementType, referenceId } = req.body;
    await InventoryService.updateStock(inventoryId, quantity, movementType, referenceId);
    res.json({ message: 'Stock updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
