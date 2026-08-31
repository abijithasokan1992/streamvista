import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

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
}

void startServer();
