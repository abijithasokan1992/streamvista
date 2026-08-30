import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

dotenv.config();

const logExporter = new OTLPLogExporter({
  url: 'https://telemetry.googleapis.com/v1/logs',
  headers: { 'x-goog-user-project': 'streamvista-495500' },
});
const sdk = new NodeSDK({ logRecordProcessor: new SimpleLogRecordProcessor({ exporter: logExporter }) });
void sdk.start();

import { initializeDb } from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import razorpayWebhook from './routes/razorpayWebhook';
import aiRoutes from './routes/ai';
import agentRoutes from './routes/agents';
import notificationRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import { ProductService } from './services/ProductService';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

const corsOrigins = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : false,
  credentials: true,
}));
app.use('/api/razorpay/webhook', razorpayWebhook);
app.use(express.json({ limit: '2mb' }));

export const authorize = (roles: string[] = []) => (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    if (roles.length > 0 && !roles.includes(user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    req.user = user;
    next();
  });
};

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authorize(), orderRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/agents', authorize(), agentRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);
app.use('/api/analytics', authorize(), analyticsRoutes);

app.use(express.static(path.join(__dirname, '../../../dist')));
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  service: 'Crayons Pictures API',
}));
app.get('/api/storage/status', (_req, res) => res.json({
  status: process.env.STORAGE_PROVIDER ? 'configured' : 'not_configured',
  provider: process.env.STORAGE_PROVIDER || null,
}));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  const message = isProduction ? 'Internal server error' : (err?.message || 'Internal server error');
  res.status(Number(err?.statusCode || 500)).json({ error: message });
});
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

async function startServer() {
  try {
    await initializeDb();
    await ProductService.seedCatalog();
    app.listen(PORT, () => console.log(`Crayons Pictures API is running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void startServer();
