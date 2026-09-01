import { Router } from 'express';
import { ProductService } from '../services/ProductService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await ProductService.getProducts(req.query);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await ProductService.getProductById(Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const compatibility = await ProductService.getCompatibility(Number(req.params.id));
    res.json({ ...product, compatibility });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const productId = await ProductService.createProduct(req.body);
    res.status(201).json({ productId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
