import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const logExporter = new OTLPLogExporter({
  url: 'https://telemetry.googleapis.com/v1/logs',
  headers: { 'x-goog-user-project': 'streamvista-495500' },
});

const sdk = new NodeSDK({
  logRecordProcessor: new SimpleLogRecordProcessor({ exporter: logExporter }),
});

sdk.start();

dotenv.config();

import { initializeDb } from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import revenueRoutes from './routes/revenue';
import aiRoutes from './routes/ai';
import agentRoutes from './routes/agents';
import notificationRoutes from './routes/notifications';
import { ProductService } from './services/ProductService';
import { authorizeSupabase } from './middleware/supabaseAuth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

export const authorize = (roles: string[] = []) => authorizeSupabase(roles);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authorize(), orderRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/revenue', authorize(), revenueRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/agents', authorize(), agentRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);

app.use(express.static(path.join(__dirname, '../../../dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), service: 'StreamVista Cloud X' });
});

app.get('/api/storage/status', (req, res) => {
  res.json({
    provider: 'OCI / GCP Multi-Cloud',
    region: 'ap-mumbai-1',
    bucket: 'bucket-20260526-1544',
    status: 'ACTIVE',
  });
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist/index.html'));
});

async function startServer() {
  try {
    await initializeDb();
    await ProductService.seedCatalog();
    app.listen(PORT, () => {
      console.log(`AutoOS API is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
