import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import paymentRoutes from './routes/payments';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';
import razorpayWebhook from './routes/razorpayWebhook';
import aiRoutes from './routes/ai';
import aiJobRoutes from './routes/ai-jobs';
import hostingerIncomingRoutes from './routes/hostingerIncoming';
import agentRoutes from './routes/agents';
import notificationRoutes from './routes/notifications';
import { initializeDb } from './config/db';
import { assertProductionRuntime, providerAvailability } from './lib/productionReadiness';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Keep every Vercel API/Auth request pinned to the same live Supabase project as the browser client.
// A stale SUPABASE_URL environment variable must never route user JWT validation to a retired project.
const CANONICAL_SUPABASE_URL = 'https://uakpqqardziifcwzvgfx.supabase.co';
const SUPABASE_URL = CANONICAL_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseAdmin() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
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

  const role = String(profile?.app_role || 'viewer');
  return {
    userId: data.user.id,
    id: data.user.id,
    email: String(profile?.email || data.user.email || '').trim().toLowerCase(),
    role,
    appRole: role,
    orgId: profile?.org_id || null,
  };
}

export const authenticateToken = async (req: any, res: any, next: any) => {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  try {
    req.user = await resolveUser(token);
    return next();
  } catch (error: any) {
    return res.status(401).json({ error: error?.message || 'Invalid or expired session' });
  }
};

export const authorize = (roles: string[] = []) => (req: any, res: any, next: any) => {
  if (roles.length > 0 && !roles.includes(String(req.user?.role || ''))) {
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

app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }), (req: any, res, next) => {
  req.url = '/webhook';
  return paymentRoutes(req, res, next);
});
app.use('/api/hostinger-incoming', express.text({ type: '*/*', limit: '2mb' }), hostingerIncomingRoutes);
app.use(express.json({ limit: '4mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authenticateToken, authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/ai-jobs', authenticateToken, aiJobRoutes);
app.use('/api/agents', authenticateToken, agentRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/legacy-razorpay-webhook', razorpayWebhook);

app.get('/api/health', (_req, res) => res.json({
  status: 'OK',
  service: 'StreamVista Command API',
  timestamp: new Date().toISOString(),
  providers: providerAvailability(),
}));

app.get('/api/readiness', (_req, res) => {
  const supabase = Boolean(SUPABASE_SERVICE_ROLE_KEY);
  const razorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const ready = supabase && razorpay;
  return res.status(ready ? 200 : 503).json({
    ready,
    checks: {
      supabase: supabase ? 'configured' : 'not_configured',
      razorpay: razorpay ? 'configured' : 'not_configured',
    },
  });
});

app.get('/api/runtime/readiness', (_req, res) => res.json(providerAvailability()));
app.get('/api/storage/status', (_req, res) => {
  const provider = process.env.STORAGE_PROVIDER;
  const bucket = process.env.OCI_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.GCS_BUCKET_NAME;
  const region = process.env.OCI_REGION || process.env.AWS_REGION || process.env.GCP_REGION;
  if (!provider || !bucket) return res.status(503).json({ status: 'UNCONFIGURED' });
  return res.json({ provider, region: region || null, bucket, status: 'CONFIGURED' });
});

app.use(express.static(path.join(__dirname, '../../../dist')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../../../dist/index.html')));

async function startServer() {
  try {
    assertProductionRuntime();
    await initializeDb();
    app.listen(PORT, () => console.log(`StreamVista Command API listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (process.env.VERCEL !== '1') void startServer();

export default app;
