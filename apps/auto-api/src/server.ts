import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';

const logExporter = new OTLPLogExporter({
  url: 'https://telemetry.googleapis.com/v1/logs', // Cloud Logging OTLP Endpoint
  headers: {
    'x-goog-user-project': 'streamvista-495500',
  },
});

const sdk = new NodeSDK({
  logRecordProcessor: new SimpleLogRecordProcessor({ exporter: logExporter }),
});

sdk.start();

import { initializeDb } from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import inventoryRoutes from './routes/inventory';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import agentRoutes from './routes/agents';
import notificationRoutes from './routes/notifications';
import { ProductService } from './services/ProductService';
import { authorizeSupabase } from './middleware/supabaseAuth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic RBAC Middleware
export const authorize = (roles: string[] = []) => {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token missing' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = user;
      next();
    });
  };
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', authorize(['admin', 'staff']), inventoryRoutes);
app.use('/api/orders', authorize(), orderRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/agents', authorize(), agentRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);

// Serve static assets from the frontend build
app.use(express.static(path.join(__dirname, '../../../dist')));

// Handle SPA routing: serve index.html for any unknown routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist/index.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), service: 'StreamVista Cloud X' });
});

app.get('/api/storage/status', (req, res) => {
  res.json({
    provider: 'OCI / GCP Multi-Cloud',
    region: 'ap-mumbai-1',
    bucket: 'bucket-20260526-1544',
    status: 'ACTIVE'
  });
});

// Start Server
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
