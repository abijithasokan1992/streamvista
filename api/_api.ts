import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const route = String(req.query.route || '').replace(/^\/+|\/+$/g, '');
  if (route === 'health' || route === '') {
    return res.status(200).json({ ok: true, service: 'streamvista-api', status: 'OK' });
  }
  return res.status(404).json({ error: 'API route not found', route });
}
