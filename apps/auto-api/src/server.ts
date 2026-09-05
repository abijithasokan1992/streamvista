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
import aiRoutes from './routes/ai';
import aiJobRoutes from './routes/ai-jobs';
import hostingerIncomingRoutes from './routes/hostingerIncoming';
import agentRoutes from './routes/agents';
import a2aRoutes from './routes/a2a';
import notificationRoutes from './routes/notifications';
import razorpayWebhook from './routes/razorpayWebhook';
import { initializeDb } from './config/db';
import { assertProductionRuntime, providerAvailability } from './lib/productionReadiness';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const A2A_PUBLIC_BASE_URL = String(process.env.A2A_PUBLIC_BASE_URL || '').replace(/\/$/, '');

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

// Canonical public Razorpay webhook endpoint. Keep raw payload handling before JSON parsing.
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), (req: any, res, next) => {
  req.url = '/';
  return razorpayWebhook(req, res, next);
});
app.use('/api/hostinger-incoming', express.text({ type: '*/*', limit: '2mb' }), hostingerIncomingRoutes);
app.use(express.json({ limit: '4mb' }));

app.get('/.well-known/agent-card.json', (_req, res) => {
  if (!A2A_PUBLIC_BASE_URL) return res.status(503).json({ error: 'A2A public base URL is not configured' });
  return res.json({
    protocolVersion: '0.3.0',
    name: 'StreamVista Business & Revenue Command Center',
    description: 'Single canonical business orchestrator for revenue, sales, buyers, creators, deals, payments and follow-up. Uses one persistent business queue and fail-closed approvals.',
    url: `${A2A_PUBLIC_BASE_URL}/a2a`,
    preferredTransport: 'JSONRPC',
    version: '1.0.0',
    documentationUrl: `${A2A_PUBLIC_BASE_URL}/docs/STREAMVISTA_PRODUCT_REVENUE_COMMAND_CENTER.md`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'opaque' },
    },
    security: [{ bearerAuth: [] }],
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['application/json', 'text/plain'],
    skills: [
      {
        id: 'business.revenue.orchestrate',
        name: 'Business Revenue Orchestration',
        description: 'Detect, deduplicate, prioritize and queue revenue-impacting business work.',
        tags: ['revenue', 'business-queue', 'orchestration'],
        examples: ['What can close today?', 'Give me the fastest verified path to ₹1 crore.'],
      },
      {
        id: 'business.buyer.match',
        name: 'Buyer Matching',
        description: 'Prepare evidence-backed buyer and content matches from verified business data.',
        tags: ['buyers', 'catalog', 'matching'],
      },
      {
        id: 'business.payment.reconcile',
        name: 'Payment Reconciliation',
        description: 'Prepare payment verification and downstream consistency checks without bypassing payment gates.',
        tags: ['payments', 'razorpay', 'reconciliation'],
      },
      {
        id: 'business.follow-up.prepare',
        name: 'Follow-up Preparation',
        description: 'Identify and prepare high-value follow-up actions without automatically sending binding communications.',
        tags: ['follow-up', 'sales', 'email'],
      },
    ],
  });
});

app.get('/.well-known/agent.json', (_req, res) => res.redirect(307, '/.well-known/agent-card.json'));

app.use('/a2a', a2aRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authenticateToken, authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/ai-jobs', authenticateToken, aiJobRoutes);
app.use('/api/agents', authenticateToken, authorize(['admin', 'staff']), agentRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

app.get('/api/health', (_req, res) => res.json({
  status: 'OK',
  service: 'StreamVista Command API',
  timestamp: new Date().toISOString(),
  providers: providerAvailability(),
}));

app.get('/api/readiness', (_req, res) => {
  const supabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
  const canonicalSupabase = Boolean(SUPABASE_URL && /uakpqqardziifcwzvgfx\.supabase\.co/i.test(SUPABASE_URL));
  const razorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const a2a = Boolean(process.env.A2A_SHARED_SECRET && A2A_PUBLIC_BASE_URL);
  const ready = supabase && canonicalSupabase && razorpay && a2a;
  return res.status(ready ? 200 : 503).json({
    ready,
    checks: {
      supabase: supabase ? 'configured' : 'not_configured',
      canonicalSupabase: canonicalSupabase ? 'configured' : 'wrong_or_unknown_project',
      razorpay: razorpay ? 'configured' : 'not_configured',
      a2a: a2a ? 'configured' : 'not_configured',
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
