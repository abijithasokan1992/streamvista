import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { runAI } from '../services/AIProviderGateway';

const router = Router();

type DataStatus = 'verified' | 'operator-estimated' | 'ai-derived' | 'unknown';

type VersionInput = {
  id?: string;
  name: string;
  format?: string | null;
  languages?: string[];
  revenue?: number | null;
  share?: number | null;
  dataStatus?: DataStatus;
};

type IntelligenceRequest = {
  project: {
    id?: string;
    title: string;
    genre?: string | null;
    runtime?: number | null;
    language?: string | null;
    productionStatus?: string | null;
    rightsStatus?: string | null;
  };
  buyer?: {
    id?: string;
    name?: string | null;
    platformType?: string | null;
    territory?: string | null;
    targetAudience?: string | null;
    formatRequirements?: string[];
    languageRequirements?: string[];
    fitSignals?: string[];
  };
  versions?: VersionInput[];
  rights?: Record<string, unknown>;
  commercialContext?: Record<string, unknown>;
  operatorConstraints?: Record<string, unknown>;
  analysisRequest?: {
    objective?: string;
    includePackaging?: boolean;
    includeBuyerStrategy?: boolean;
    includeRoiProjection?: boolean;
  };
};

const db = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Object.assign(new Error('Supabase server configuration is missing'), { code: 'supabase_not_configured' });
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
};

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateInput(body: any): { value: IntelligenceRequest; errors: string[] } {
  const errors: string[] = [];
  const project = body?.project;
  if (!project || typeof project !== 'object') errors.push('project is required');
  if (!String(project?.title || '').trim()) errors.push('project.title is required');

  const versions: VersionInput[] = Array.isArray(body?.versions) ? body.versions : [];
  versions.forEach((version, index) => {
    if (!String(version?.name || '').trim()) errors.push(`versions[${index}].name is required`);
    const share = asNumber(version?.share);
    if (share !== null && (share < 0 || share > 100)) errors.push(`versions[${index}].share must be between 0 and 100`);
    const revenue = asNumber(version?.revenue);
    if (revenue !== null && revenue < 0) errors.push(`versions[${index}].revenue must be non-negative`);
    if (version?.dataStatus && !['verified', 'operator-estimated', 'ai-derived', 'unknown'].includes(version.dataStatus)) {
      errors.push(`versions[${index}].dataStatus is invalid`);
    }
  });

  return {
    value: {
      project: {
        ...project,
        title: String(project?.title || '').trim(),
        runtime: asNumber(project?.runtime),
      },
      buyer: body?.buyer && typeof body.buyer === 'object' ? body.buyer : undefined,
      versions,
      rights: body?.rights && typeof body.rights === 'object' ? body.rights : {},
      commercialContext: body?.commercialContext && typeof body.commercialContext === 'object' ? body.commercialContext : {},
      operatorConstraints: body?.operatorConstraints && typeof body.operatorConstraints === 'object' ? body.operatorConstraints : {},
      analysisRequest: body?.analysisRequest && typeof body.analysisRequest === 'object' ? body.analysisRequest : {},
    },
    errors,
  };
}

function normalizeVersions(versions: VersionInput[]) {
  return versions.map((version) => {
    const revenue = asNumber(version.revenue);
    const share = asNumber(version.share);
    const netYield = revenue !== null && share !== null ? revenue * (share / 100) : null;
    return {
      ...version,
      name: String(version.name).trim(),
      languages: Array.isArray(version.languages) ? version.languages.map(String) : [],
      revenue,
      share,
      netYield,
      dataStatus: version.dataStatus || 'unknown',
    };
  });
}

function totalYield(versions: ReturnType<typeof normalizeVersions>) {
  return versions.reduce((sum, version) => sum + (version.netYield ?? 0), 0);
}

const SYSTEM_PROMPT = `You are StreamVista Intelligence. Analyze only the supplied StreamVista context.

Rules:
- Never invent missing StreamVista facts.
- Treat UNKNOWN values as unknown; do not turn them into numbers.
- Distinguish VERIFIED, OPERATOR-ESTIMATED, AI-DERIVED and UNKNOWN.
- Recommend packaging, sequencing and buyer strategy using supplied constraints.
- Do not override rights or commercial limits.
- Explain rationale briefly and explicitly identify assumptions.
- Deterministic arithmetic is handled by the server; do not contradict supplied server calculations.
- Return valid JSON only with keys: packagingStrategy, recommendations, buyerStrategy, roiProjection, confidence, dataQuality.`;

router.post('/', async (req: any, res: any) => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Session required', code: 'session_required' });

  const { value, errors } = validateInput(req.body);
  if (errors.length) return res.status(400).json({ success: false, error: 'Invalid intelligence input', code: 'validation_failed', details: errors });

  try {
    const client = db();
    const normalizedVersions = normalizeVersions(value.versions || []);
    const deterministicYield = totalYield(normalizedVersions);

    let projectRecord: any = null;
    let rightsRecord: any[] = [];
    let buyerRecord: any = null;

    if (value.project.id) {
      const { data, error } = await client
        .from('sv_app_titles')
        .select('id,title,synopsis,content_type,primary_language,status,commercial_profile,metadata')
        .eq('id', value.project.id)
        .maybeSingle();
      if (error) return res.status(503).json({ success: false, error: error.message, code: 'project_lookup_failed' });
      projectRecord = data;

      if (!projectRecord) return res.status(404).json({ success: false, error: 'Project not found', code: 'project_not_found' });

      const rightsQuery = await client
        .from('sv_title_rights')
        .select('id,territory,platform,exclusivity,licensing_model,rights_start_date,rights_end_date,licensed_buyer_id')
        .eq('title_id', value.project.id);
      if (rightsQuery.error) return res.status(503).json({ success: false, error: rightsQuery.error.message, code: 'rights_lookup_failed' });
      rightsRecord = rightsQuery.data || [];
    }

    if (value.buyer?.id) {
      const { data, error } = await client
        .from('sv_app_profiles')
        .select('id,display_name,email,app_role,verification_status')
        .eq('id', value.buyer.id)
        .maybeSingle();
      if (error) return res.status(503).json({ success: false, error: error.message, code: 'buyer_lookup_failed' });
      buyerRecord = data;
      if (!buyerRecord) return res.status(404).json({ success: false, error: 'Buyer not found', code: 'buyer_not_found' });
    }

    const facts = {
      project: { ...value.project, sourceRecord: projectRecord },
      buyer: { ...value.buyer, sourceRecord: buyerRecord },
      versions: normalizedVersions,
      rights: { ...value.rights, sourceRecords: rightsRecord },
      commercialContext: value.commercialContext,
      operatorConstraints: value.operatorConstraints,
      arithmetic: {
        currency: value.commercialContext?.currency || 'INR',
        totalNetYield: deterministicYield,
        versionNetYields: normalizedVersions.map((v) => ({ name: v.name, netYield: v.netYield })),
      },
    };

    const prompt = JSON.stringify({
      FACTS: facts,
      OBJECTIVE: value.analysisRequest?.objective || 'maximize realistic multi-version yield',
      TASKS: {
        packaging: value.analysisRequest?.includePackaging !== false,
        buyerStrategy: value.analysisRequest?.includeBuyerStrategy !== false,
        roiProjection: value.analysisRequest?.includeRoiProjection !== false,
      },
    });

    const result = await runAI({
      capability: 'buyer_matchmaker',
      system: SYSTEM_PROMPT,
      prompt,
      provider: process.env.INTELLIGENCE_AI_PROVIDER as any,
      model: process.env.INTELLIGENCE_AI_MODEL,
      maxTokens: 1800,
    });

    let ai: any = {};
    try {
      ai = JSON.parse(result.text || '{}');
    } catch {
      return res.status(502).json({ success: false, error: 'AI provider returned non-JSON intelligence output', code: 'invalid_structured_output' });
    }

    const output = {
      status: 'success',
      analysis: {
        totalYield: deterministicYield,
        currency: value.commercialContext?.currency || 'INR',
        versions: normalizedVersions,
        packagingStrategy: ai.packagingStrategy || {},
        recommendations: Array.isArray(ai.recommendations) ? ai.recommendations : [],
        buyerStrategy: ai.buyerStrategy || {},
        roiProjection: ai.roiProjection || {},
        confidence: ai.confidence || { level: 'unknown', rationale: 'Insufficient evidence for a stronger confidence claim.' },
        dataQuality: ai.dataQuality || {
          verified: normalizedVersions.filter((v) => v.dataStatus === 'verified').length,
          operatorEstimated: normalizedVersions.filter((v) => v.dataStatus === 'operator-estimated').length,
          aiDerived: normalizedVersions.filter((v) => v.dataStatus === 'ai-derived').length,
          unknown: normalizedVersions.filter((v) => v.dataStatus === 'unknown').length,
        },
      },
      audit: {
        projectId: value.project.id || null,
        operatorId: userId,
        provider: result.provider,
        model: result.model,
        providerRequestId: result.providerRequestId || null,
        timestamp: new Date().toISOString(),
      },
    };

    return res.json(output);
  } catch (error: any) {
    const status = error?.code === 'provider_not_configured' || error?.code === 'supabase_not_configured' ? 503 : 502;
    return res.status(status).json({ success: false, error: error?.message || 'Intelligence execution failed', code: error?.code || 'intelligence_failed' });
  }
});

export default router;
