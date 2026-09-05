# SV Muse — Production Release Record

## Scope

This release wires the existing SV Muse / Crayons Pictures AI Studio control plane to the canonical StreamVista backend contracts without introducing a duplicate database or fake media execution path.

## Production findings

- Supabase production project: `uakpqqardziifcwzvgfx`
- Canonical job persistence: `public.ai_runs` + `public.ai_outputs`
- Media persistence already available: `assets`, `subtitles`, `dubs`, `audio_descriptions`, `qc_runs`, `masters`, `deliverables`, `delivery_manifests`
- Rights/audit persistence already available: `rights_claims`, `rights_documents`, `licenses`, `approvals`, `audit_logs`
- The previous `/api/ai-jobs` implementation referenced `cps_ai_runs`, which does not exist in production; this release removes that schema drift.

## Implemented

1. Added the `sv_muse_ai_job_contract_v1` migration to extend `ai_runs` with durable tool/job state and execution metadata.
2. Rewired `/api/ai-jobs` to persist and retrieve jobs from canonical `ai_runs` and `ai_outputs`.
3. Added the SV Muse capability registry with explicit `live`, `partial`, and `unavailable` runtime states.
4. Added `GET /api/ai/capabilities` so the frontend can render only capabilities supported by the deployed backend.
5. Kept existing provider credentials server-side.
6. Prevented unsupported media tools from presenting fake successful execution.

## Current live execution set

### Live via existing provider gateway

- AI Search (assistant/search over supplied context)
- Logline
- Synopsis
- Script Optimizer
- Shorts Script
- Buyer Matchmaker

### Partial — durable data contracts exist, but media execution is incomplete

- Video Translation
- AI Character
- AI Subtitles
- AI Dubbing
- Audio Description
- AI Editing
- OTT / TV Delivery

### Unavailable until a real provider adapter is configured

- Image Generator
- Video Generator
- Voice Generator
- Text to Speech
- Music Generator
- Background Remover

## Release rule

Unsupported tools must show `Unavailable in this deployment`; they must never simulate success.

## Verification status

- Supabase migration applied successfully.
- `ai_runs` and `ai_outputs` exist in the canonical production project.
- Current `main` Vercel checks are green for the StreamVista and Bridge projects.
- The user-provided `antigravity-live-*` deployment URL is not proven to be the current canonical Vercel production artifact because it is Vercel SSO-protected and no Vercel deployment mutation connector is available in this session.
- Live authenticated AI-provider execution and full browser E2E remain required before the release can be certified as fully production-green.
