# GlowDx India — AI K-Beauty D2C

## Product contract

Mobile-first D2C experience: selfie → informational skin signals → routine → bundle → subscription → adherence → progress.

## Routes

- `/glowdx` — landing + scan entry + signal preview
- `/scan` — camera capture, MediaPipe face landmarks, TensorFlow.js/Replicate inference orchestration
- `/routine` — personalized 4-step routine, confidence and explanation cards
- `/shop` — headless Shopify products, bundle and single-item purchase
- `/track` — progress photos and AI-assisted before/after comparison

## AI boundary

Use camera-side face landmarking only for capture guidance and face ROI normalization. Run the skin-condition model behind a server boundary (Replicate or an approved hosted model). Treat outputs as cosmetic/informational signals, not diagnoses. Store model version, confidence, input consent and analysis timestamp.

## Data

Supabase Auth + Postgres + Storage. Suggested entities: profiles, scans, scan_findings, routines, routine_items, products, subscriptions, progress_photos, whatsapp_optins, creator_ugc.

## Commerce

Shopify Buy SDK is the source for product/catalog/checkout state. Razorpay is the India payment/subscription rail; keep webhook verification server-side and persist idempotency keys. AED display can be a presentation layer until a Middle East fulfillment/tax contract is live.

## Product safety

Do not assert “chemical-free” because everything made of matter is chemical. Instead, model user-facing filters as “ingredient-screened”, “EWG-reviewed where verified”, fragrance-free, alcohol-free, etc., backed by supplier evidence and expiry dates. Do not publish EWG or certification claims without source verification.

## Production gates

1. Auth and RLS verified.
2. Camera permission + local capture works on supported mobile browsers.
3. Model inference has latency/error fallback.
4. Product recommendation rules are deterministic and auditable.
5. Shopify checkout + Razorpay subscription state reconcile via webhooks.
6. Progress photos use private storage policies.
7. WhatsApp opt-in and messaging comply with applicable rules.
8. No secrets committed to Git.
