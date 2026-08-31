import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const GITHUB_OWNER = String(process.env.GITHUB_ORG || process.env.GITHUB_OWNER || 'abijithasokan1992').trim();
const GITHUB_TOKEN = String(process.env.GITHUB_TOKEN || '').trim();

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is missing');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  return message
    .replace(/ghs_[A-Za-z0-9_\-]+/g, '[REDACTED]')
    .replace(/github_pat_[A-Za-z0-9_\-]+/g, '[REDACTED]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .slice(0, 500);
}

function adminOnly(req: any) {
  const role = String(req.user?.role || req.user?.appRole || '').trim();
  return ['founder', 'super_admin', 'admin'].includes(role);
}

async function githubFetch(path: string) {
  if (!GITHUB_TOKEN) throw new Error('GitHub server credential is not configured');
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'StreamVista-Command-Center',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub API ${response.status}: ${body || response.statusText}`);
  }
  return response.json();
}

function normalizeRepo(repo: any, snapshotAt: string) {
  return {
    provider: 'github',
    external_id: String(repo.id),
    full_name: String(repo.full_name),
    name: String(repo.name),
    owner: String(repo.owner?.login || GITHUB_OWNER),
    default_branch: repo.default_branch ? String(repo.default_branch) : null,
    visibility: repo.visibility ? String(repo.visibility) : repo.private ? 'private' : 'public',
    archived: Boolean(repo.archived),
    html_url: repo.html_url ? String(repo.html_url) : null,
    clone_url: repo.clone_url ? String(repo.clone_url) : null,
    github_updated_at: repo.updated_at ? String(repo.updated_at) : null,
    snapshot_at: snapshotAt,
    raw_metadata: repo,
  };
}

router.post('/sync', async (req: any, res: any) => {
  const db = supabaseAdmin();
  if (!req.user || !adminOnly(req)) return res.status(403).json({ error: 'Admin control-plane access required' });

  const startedAt = new Date().toISOString();
  let syncId: string | null = null;

  try {
    const { data: run, error: runError } = await db
      .from('command_center_sync_runs')
      .insert({ provider: 'github', status: 'running', started_at: startedAt, repositories_discovered: 0 })
      .select('id,started_at,status')
      .single();
    if (runError || !run) throw new Error(runError?.message || 'Unable to create sync run');
    syncId = run.id;

    await db.from('command_center_audit_events').insert({
      event_type: 'github_sync_started',
      actor_type: 'user',
      actor_id: req.user.userId || req.user.id || null,
      provider: 'github',
      entity_type: 'sync_run',
      entity_id: syncId,
      status: 'running',
      payload: { owner: GITHUB_OWNER },
    });

    const repos = await githubFetch(`/user/repos?per_page=100&affiliation=owner,collaborator,organization_member&sort=updated&direction=desc`);
    const list = Array.isArray(repos) ? repos : [];
    const snapshotAt = new Date().toISOString();

    for (const repo of list) {
      const normalized = normalizeRepo(repo, snapshotAt);
      const { data: stored, error: repoError } = await db
        .from('command_center_repositories')
        .upsert(normalized, { onConflict: 'provider,external_id' })
        .select('id')
        .single();
      if (repoError || !stored) throw new Error(repoError?.message || `Unable to persist ${normalized.full_name}`);

      const { error: snapshotError } = await db
        .from('command_center_repository_snapshots')
        .insert({ sync_run_id: syncId, repository_id: stored.id, snapshot: normalized.raw_metadata });
      if (snapshotError) throw new Error(snapshotError.message);
    }

    const completedAt = new Date().toISOString();
    await db
      .from('command_center_sync_runs')
      .update({ status: 'success', completed_at: completedAt, repositories_discovered: list.length })
      .eq('id', syncId);

    await db.from('command_center_audit_events').insert({
      event_type: 'github_sync_succeeded',
      actor_type: 'user',
      actor_id: req.user.userId || req.user.id || null,
      provider: 'github',
      entity_type: 'sync_run',
      entity_id: syncId,
      status: 'success',
      payload: { repositories_discovered: list.length, owner: GITHUB_OWNER },
    });

    return res.status(200).json({
      syncId,
      status: 'success',
      repositoriesDiscovered: list.length,
      startedAt,
      completedAt,
    });
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = safeError(error);

    if (syncId) {
      await db
        .from('command_center_sync_runs')
        .update({ status: 'failed', completed_at: completedAt, error_code: 'SYNC_FAILED', error_message: message })
        .eq('id', syncId);

      await db.from('command_center_audit_events').insert({
        event_type: 'github_sync_failed',
        actor_type: 'user',
        actor_id: req.user?.userId || req.user?.id || null,
        provider: 'github',
        entity_type: 'sync_run',
        entity_id: syncId,
        status: 'failed',
        payload: { error_code: 'SYNC_FAILED', error_message: message },
      });
    }

    return res.status(503).json({
      syncId,
      status: 'failed',
      error: message,
      startedAt,
      completedAt,
    });
  }
});

router.get('/status', async (req: any, res: any) => {
  const db = supabaseAdmin();
  if (!req.user || !adminOnly(req)) return res.status(403).json({ error: 'Admin control-plane access required' });

  const [{ data: latestRun, error: latestRunError }, { count: repositoryCount, error: repoCountError }] = await Promise.all([
    db
      .from('command_center_sync_runs')
      .select('id,status,started_at,completed_at,repositories_discovered,error_code,error_message')
      .eq('provider', 'github')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('command_center_repositories')
      .select('id', { count: 'exact', head: true })
      .eq('provider', 'github'),
  ]);

  if (latestRunError) return res.status(503).json({ error: latestRunError.message });
  if (repoCountError) return res.status(503).json({ error: repoCountError.message });

  const { data: successfulRun, error: successfulRunError } = await db
    .from('command_center_sync_runs')
    .select('id,status,started_at,completed_at,repositories_discovered')
    .eq('provider', 'github')
    .eq('status', 'success')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (successfulRunError) return res.status(503).json({ error: successfulRunError.message });

  return res.status(200).json({
    provider: 'github',
    owner: GITHUB_OWNER,
    latestRun: latestRun || null,
    latestSuccessfulSync: successfulRun || null,
    repositoryCount: repositoryCount || 0,
    neverSynced: !successfulRun,
    lastError: latestRun?.status === 'failed' ? { code: latestRun.error_code, message: latestRun.error_message } : null,
  });
});

export default router;
