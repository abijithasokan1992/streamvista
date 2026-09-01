import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import paymentRoutes from './routes/payments';

dotenv.config();

import { initializeDb } from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import razorpayWebhook from './routes/razorpayWebhook';
import aiRoutes from './routes/ai';
import aiJobRoutes from './routes/ai-jobs';
import hostingerIncomingRoutes from './routes/hostingerIncoming';
import agentRoutes from './routes/agents';
import notificationRoutes from './routes/notifications';
import { assertProductionRuntime, providerAvailability } from './lib/productionReadiness';

const logExporter = new OTLPLogExporter({
  url: 'https://telemetry.googleapis.com/v1/logs',
  headers: { 'x-goog-user-project': 'streamvista-495500' },
});
const sdk = new NodeSDK({ logRecordProcessor: new SimpleLogRecordProcessor({ exporter: logExporter }) });
void sdk.start();

const app = express();
const PORT = process.env.PORT || 3000;

function requiredJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

app.use(cors({ origin: true }));
app.use('/api/razorpay/webhook', razorpayWebhook);
app.use('/api/hostinger-incoming', express.text({ type: '*/*', limit: '2mb' }), hostingerIncomingRoutes);
app.use(express.json({ limit: '4mb' }));

export const authorize = (roles: string[] = []) => (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  try {
    const user = jwt.verify(token, requiredJwtSecret()) as Record<string, unknown>;
    if (roles.length > 0 && !roles.includes(String(user.role || ''))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authorize(), orderRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/ai-jobs', authorize(), aiJobRoutes);
app.use('/api/agents', authorize(), agentRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);

app.use(express.static(path.join(__dirname, '../../../dist')));
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'StreamVista', providers: providerAvailability() }));
app.get('/api/runtime/readiness', (_req, res) => res.json(providerAvailability()));
app.get('/api/storage/status', (_req, res) => {
  const provider = process.env.STORAGE_PROVIDER;
  const bucket = process.env.OCI_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.GCS_BUCKET_NAME;
  const region = process.env.OCI_REGION || process.env.AWS_REGION || process.env.GCP_REGION;
  if (!provider || !bucket) return res.status(503).json({ status: 'UNCONFIGURED' });
  return res.json({ provider, region: region || null, bucket, status: 'CONFIGURED' });
});
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../../../dist/index.html')));

async function startServer() {
  try {
    assertProductionRuntime();
    await initializeDb();
    app.listen(PORT, () => console.log(`StreamVista API is running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
export const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

function supabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is missing');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function resolveUser(accessToken: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server configuration is missing');
  }
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
    const user = await resolveUser(token);
    req.user = user;
    next();
  } catch (error: any) {
    if (JWT_SECRET) {
      try {
        const legacyUser = jwt.verify(token, JWT_SECRET) as any;
        req.user = legacyUser;
        return next();
      } catch {
        // Fall through to fail closed.
      }
    }
    return res.status(401).json({ error: error?.message || 'Invalid or expired token' });
  }
};

export const authorize = (roles: string[] = []) => (req: any, res: any, next: any) => {
  if (roles.length > 0 && !roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Razorpay-Signature'],
  credentials: false,
}));

// JSON parser is intentionally mounted after the raw webhook parser.
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

app.get('/api/readiness', async (_req, res) => {
  const checks: Record<string, string> = {
    supabase: 'not_configured',
    razorpay: 'not_configured',
  };
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) checks.supabase = 'configured';
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) checks.razorpay = 'configured';
  const ready = checks.supabase === 'configured' && checks.razorpay === 'configured';
  res.status(ready ? 200 : 503).json({ ready, checks });
});

app.use(express.static(path.join(__dirname, '../../../dist')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '../../../dist/index.html')));

// Vercel imports the app as a serverless handler; local/VM deployments still use listen().
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`StreamVista Command API listening on port ${PORT}`));
}

export default app;
