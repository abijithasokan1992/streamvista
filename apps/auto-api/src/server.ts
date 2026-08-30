import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDbClient, initializeDb } from './config/db';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));

export const authorize = (roles: string[] = []) => async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Access token missing' });

    const { data, error } = await getDbClient().auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired access token' });

    const { data: profile, error: profileError } = await getDbClient()
      .from('sv_app_profiles')
      .select('id,app_role,verification_status,email,display_name')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError) return res.status(503).json({ error: profileError.message });
    if (!profile) return res.status(403).json({ error: 'Profile not provisioned' });
    if (roles.length > 0 && !roles.includes(profile.app_role)) return res.status(403).json({ error: 'Insufficient permissions' });

    req.user = {
      userId: data.user.id,
      email: data.user.email,
      role: profile.app_role,
      verificationStatus: profile.verification_status,
      profile,
    };
    return next();
  } catch (err: any) {
    return res.status(503).json({ error: err.message || 'Authorization service unavailable' });
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/payments', authorize(), paymentRoutes);
app.use('/api/ai', authorize(), aiRoutes);
app.use('/api/notifications', authorize(), notificationRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await initializeDb();
    res.json({ status: 'ok', service: 'crayons-pictures-api', database: 'supabase', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', service: 'crayons-pictures-api', database: 'unavailable' });
  }
});

app.get('/api/readiness', async (_req, res) => {
  try {
    await initializeDb();
    const { error } = await getDbClient().from('sv_app_profiles').select('id', { head: true, count: 'exact' }).limit(1);
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
