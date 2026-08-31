import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import paymentRoutes from './routes/payments';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function resolveUser(accessToken: string) {
  const client = supabaseAdmin();
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) throw new Error('Invalid or expired Supabase session');

  const { data: profile, error: profileError } = await client
    .from('sv_app_profiles')
    .select('id,email,app_role,org_id,is_active')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  const email = String(profile?.email || data.user.email || '').trim().toLowerCase();
  const role = String(profile?.app_role || 'viewer');
  return {
    userId: data.user.id,
    id: data.user.id,
    email,
    role,
    appRole: role,
    orgId: profile?.org_id || null,
  };
}

export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  try {
    req.user = await resolveUser(token);
    return next();
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Invalid or expired Supabase session' });
  }
};

export const authorize = (roles: string[] = []) => (req: any, res: any, next: any) => {
  if (roles.length > 0 && !roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  return next();
};

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Razorpay-Signature'],
  credentials: false,
}));

app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any, next: any) => {
  req.url = '/webhook';
  return paymentRoutes(req, res, next);
});
app.use(express.json());

app.post('/api/payments/create-order', authenticateToken, async (req, res, next) => {
  req.url = '/create-order';
  return paymentRoutes(req, res, next);
});
app.post('/api/payments/verify', authenticateToken, async (req, res, next) => {
  req.url = '/verify';
  return paymentRoutes(req, res, next);
});
app.get('/api/payments/revenue', authenticateToken, async (req, res, next) => {
  req.url = '/revenue';
  return paymentRoutes(req, res, next);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', service: 'StreamVista Command API', timestamp: new Date().toISOString() });
});

app.get('/api/readiness', (_req, res) => {
  const checks: Record<string, string> = {
    supabase: SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'not_configured',
    razorpay: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'configured' : 'not_configured',
  };
  const ready = checks.supabase === 'configured' && checks.razorpay === 'configured';
  res.status(ready ? 200 : 503).json({ ready, checks });
});

app.use(express.static(path.join(__dirname, '../../../dist')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../../../dist/index.html')));

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`StreamVista Command API listening on port ${PORT}`));
}

export default app;