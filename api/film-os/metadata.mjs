import { createClient } from '@supabase/supabase-js';

function getSupabase(req) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase is not configured.');
  return createClient(url, key, { global: { headers: { Authorization: req.headers.authorization || '' } } });
}

export default async function handler(req, res) {
  try {
    const sb = getSupabase(req);
    if (req.method === 'GET') {
      const { projectId } = req.query || {};
      if (!projectId) return res.status(400).json({ error: 'projectId is required' });
      const { data, error } = await sb.from('film_metadata').select('*').eq('project_id', projectId).maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ metadata: data });
    }
    if (req.method !== 'POST' && req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const body = req.body || {};
    if (!body.project_id || !body.canonical_title?.trim()) return res.status(400).json({ error: 'project_id and canonical_title are required' });
    const payload = {
      ...body,
      canonical_title: body.canonical_title.trim(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await sb.from('film_metadata').upsert(payload, { onConflict: 'project_id' }).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ metadata: data });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Metadata request failed' });
  }
}
