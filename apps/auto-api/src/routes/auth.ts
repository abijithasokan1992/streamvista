import { Router } from 'express';
import { AuthService } from '../services/AuthService';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const userId = await AuthService.signup(req.body);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
