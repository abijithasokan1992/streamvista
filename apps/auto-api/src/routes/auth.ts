import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { fail, ok } from '../lib/http';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const userId = await AuthService.signup(req.body);
    return ok(res, req, { userId, message: 'User created successfully' }, 201);
  } catch {
    return fail(res, req, 400, { code: 'SIGNUP_FAILED', message: 'Signup failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    return ok(res, req, result);
  } catch {
    return fail(res, req, 401, { code: 'LOGIN_FAILED', message: 'Invalid email or password.' });
  }
});

export default router;
