import { Router } from 'express';
import { OrderService } from '../services/OrderService';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/customer/:id', async (req, res) => {
  try {
    const orders = await OrderService.getOrdersByCustomer(String(req.params.id));
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await OrderService.getOrderDetails(String(req.params.id));
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
