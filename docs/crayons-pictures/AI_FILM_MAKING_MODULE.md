# Crayons Pictures — AI Film Making Module

## Purpose
Build a provider-neutral AI filmmaking layer for Crayons Pictures / StreamVista Creator Cloud. The module orchestrates script, storyboard, image, video, audio, dubbing, translation, editing and delivery workflows without hard-coding a single AI vendor.

## Meta integration
Meta currently publishes Llama resources and a Meta Model API. Current Meta materials list Llama 4 Scout and Maverick as multimodal models and describe Meta Model API access to current Muse models. Availability and pricing are provider/account dependent. Therefore the product must not promise unlimited free API usage.

## Architecture
UI → Film Project API → Job Orchestrator → Provider Registry → Model Adapter → Artifact Store → Job Events → Creator Studio

### Capability registry
- text_reasoning
- script_generation
- story_structure
- storyboard_prompting
- image_generation
- image_editing
- video_generation
- video_understanding
- speech_to_text
- text_to_speech
- translation
- dubbing
- music_audio
- safety_moderation
- embeddings

### Meta adapter
Implement a server-side `meta` adapter with environment-backed credentials, configurable model IDs, OpenAI-compatible transport where supported, timeout/retry handling, structured errors, usage/cost telemetry and capability discovery. Never expose provider keys to web or Expo clients.

## Film pipeline
1. Idea → logline
2. Logline → synopsis
3. Synopsis → beat sheet
4. Beat sheet → screenplay
5. Screenplay → shot list
6. Shot list → storyboard prompts
7. Storyboard → visual assets
8. Visual assets → video/previs
9. Dialogue → voice/dubbing
10. Translation → multilingual tracks
11. Assembly → edit package
12. QC → compliance/rights checks
13. Export → delivery package

## Job model
Use the existing `sv_ai_jobs` concept with `queued | processing | done | failed`. Record provider, model, capability, input/output references, estimated and actual usage/cost, timestamps and failure metadata.

## Free/low-cost routing
Route eligible development workloads to currently free-allowance providers or locally hosted/open-weight models when available. Free status, quotas, rate limits and commercial terms must be checked against current provider terms/configuration; never hard-code a claim of unlimited free access.

## Rights and safety
- Require authorization for uploaded source material.
- Keep private project assets private.
- Preserve provider/model provenance.
- Record generation metadata.
- Run safety checks before publication.
- Do not misrepresent AI-generated work as human-generated.

## First implementation slice
Build the provider registry, adapter contract, Meta adapter interface and Creator Studio job-status integration first. Add concrete credentials only through secure deployment environment configuration.
