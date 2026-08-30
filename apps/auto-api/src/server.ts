import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { initializeDb, getDbClient } from './config/db';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required in the production environment');

app.use(cors());
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

export const authorize = (roles: string[] = []) => async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    const user: any = jwt.verify(token, JWT_SECRET);
    const db = getDbClient();
    const { data: profile, error } = await db.from('sv_app_profiles').select('id,app_role,verification_status').eq('id', user.userId || user.id).maybeSingle();
    if (error) return res.status(503).json({ error: error.message });
    if (!profile) return res.status(403).json({ error: 'Profile not provisioned' });
    if (roles.length > 0 && !roles.includes(profile.app_role)) return res.status(403).json({ error: 'Insufficient permissions' });
    req.user = { ...user, userId: profile.id, role: profile.app_role, verificationStatus: profile.verification_status };
    next();
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Invalid or expired token' });
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'crayons-pictures-api', timestamp: new Date().toISOString() }));
app.get('/api/readiness', async (_req, res) => {
  try {
    const db = getDbClient();
    const { error } = await db.from('sv_app_profiles').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) return res.status(503).json({ ready: false, checks: { database: false }, error: error.message });
    res.json({ ready: true, checks: { database: true, configuration: true } });
  } catch (err: any) {
    res.status(503).json({ ready: false, checks: { database: false }, error: err.message });
  }
});

async function startServer() {
  await initializeDb();
  app.listen(PORT, () => console.log(`Crayons Pictures API listening on ${PORT}`));
}

void startServer().catch((err) => {
  console.error('Production API startup failed:', err);
  process.exit(1);
});
