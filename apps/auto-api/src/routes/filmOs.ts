import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requiredEnv, requiredUrlEnv } from '../config/env';
import { fail, ok } from '../lib/http';
import { featureFlags } from '../lib/features';

const router = Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function admin() {
  return createClient(requiredUrlEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function resolveOrganizationId(db: ReturnType<typeof admin>, userId: string) {
  const { data, error } = await db
    .from('memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.organization_id || null;
}

router.post('/create-project', async (req: any, res) => {
  if (!featureFlags().filmOsWriteEnabled) {
    return fail(res, req, 503, { code: 'FEATURE_DISABLED', message: 'Film OS project creation is currently unavailable.' });
  }
  const userId = String(req.user?.userId || req.user?.id || '').trim();
  if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Secure session required.' });
  const name = String(req.body?.name || '').trim();
  if (!name || name.length < 2) return fail(res, req, 400, { code: 'INVALID_NAME', message: 'Project name must contain at least 2 characters.' });

  try {
    const db = admin();
    const organizationId = await resolveOrganizationId(db, userId);
    if (!organizationId) return fail(res, req, 403, { code: 'ORG_MEMBERSHIP_REQUIRED', message: 'Organization membership is required to create a project.' });

    const { data: project, error } = await db
      .from('film_projects')
      .insert({
        organization_id: organizationId,
        name,
        created_by: userId,
        stage: 'development',
        approval_state: 'draft',
      })
      .select('id,name,logline,synopsis,stage,approval_state,organization_id,created_at')
      .single();
    if (error) return fail(res, req, 503, { code: 'PROJECT_CREATE_FAILED', message: 'Could not create project.' });

    await db.from('project_members').upsert({
      project_id: project.id,
      user_id: userId,
      role: 'owner',
    }, { onConflict: 'project_id,user_id' });

    return ok(res, req, { project }, 201);
  } catch {
    return fail(res, req, 503, { code: 'FILM_OS_UNAVAILABLE', message: 'Film OS service is currently unavailable.' });
  }
});

router.post('/generate', async (req: any, res) => {
  if (!featureFlags().filmOsWriteEnabled) {
    return fail(res, req, 503, { code: 'FEATURE_DISABLED', message: 'Film OS generation is currently unavailable.' });
  }
  const userId = String(req.user?.userId || req.user?.id || '').trim();
  if (!userId) return fail(res, req, 401, { code: 'SESSION_REQUIRED', message: 'Secure session required.' });
  const projectId = String(req.body?.projectId || '').trim();
  const concept = String(req.body?.concept || '').trim();
  if (!UUID_RE.test(projectId)) return fail(res, req, 400, { code: 'INVALID_PROJECT_ID', message: 'A valid projectId is required.' });
  if (!concept || concept.length < 8) return fail(res, req, 400, { code: 'INVALID_CONCEPT', message: 'Concept must contain at least 8 characters.' });

  try {
    const db = admin();
    const { data: membership, error: membershipError } = await db
      .from('project_members')
      .select('project_id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();
    if (membershipError) return fail(res, req, 503, { code: 'PROJECT_ACCESS_CHECK_FAILED', message: 'Could not verify project access.' });
    if (!membership) return fail(res, req, 403, { code: 'PROJECT_FORBIDDEN', message: 'You are not authorized for this project.' });

    const scriptTitle = `Development package · ${new Date().toISOString().slice(0, 10)}`;
    const { data: script, error: scriptError } = await db
      .from('scripts')
      .insert({ project_id: projectId, title: scriptTitle })
      .select('id,title,project_id')
      .single();
    if (scriptError) return fail(res, req, 503, { code: 'SCRIPT_CREATE_FAILED', message: 'Could not create development package.' });

    const { data: version, error: versionError } = await db
      .from('script_versions')
      .insert({
        script_id: script.id,
        version_number: 1,
        content: concept,
        approval_state: 'review',
        created_by: userId,
      })
      .select('id,script_id,version_number,approval_state,created_at')
      .single();
    if (versionError) return fail(res, req, 503, { code: 'SCRIPT_VERSION_CREATE_FAILED', message: 'Could not store generated package.' });

    await db.from('scripts').update({ current_version_id: version.id }).eq('id', script.id);
    await db.from('film_projects').update({ logline: concept, stage: 'development', approval_state: 'review', updated_at: new Date().toISOString() }).eq('id', projectId);

    return ok(res, req, {
      nextAction: 'Review the generated package before approving downstream departments.',
      script: {
        id: script.id,
        title: script.title,
        logline: concept,
      },
      scriptVersion: version,
    }, 201);
  } catch {
    return fail(res, req, 503, { code: 'FILM_OS_UNAVAILABLE', message: 'Film OS service is currently unavailable.' });
  }
});

export default router;
