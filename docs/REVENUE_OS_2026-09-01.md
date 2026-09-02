# StreamVista Revenue OS — 2026-09-01

## Executive decision
Use `abijithasokan1992/streamvista` as the canonical product/source-of-truth. Consolidate existing surfaces into monetizable product lanes instead of creating duplicate apps.

## Revenue stack
- **Cash now:** Film Rights & OTT Readiness service + paid onboarding.
- **Transaction revenue:** Crayons Bridge licensing/rights marketplace.
- **Recurring revenue:** StreamVista OS subscriptions and usage.
- **High-value services:** Crayons Pictures AI Studio conversion/production packages.
- **Internal leverage:** Founder Command / Control Plane.

## System architecture
`streamvista.in` → conversion surfaces → Supabase Auth/RLS → StreamVista/Film OS data → Razorpay → fulfillment → Amplitude revenue events.

Ramp Data is an external benchmark/intelligence input for pricing, vendor economics and operating decisions. It is not the source of customer revenue truth.

## Existing capabilities to reuse
The verified Supabase project contains `sv_app_profiles`, `sv_app_titles`, `sv_title_rights`, `sv_screening_requests`, `sv_marketplace_deals`, `sv_deal_offers`, `sv_payments`, `sv_delivery_entitlements`, sales pipeline tables, finance tables, Razorpay facts and command-center structures. RLS is enabled on these tables.

The repository already contains prior work for Creator Studio, Crayons Bridge, Razorpay payment flow, AI chat/provider foundation, Product Design → Build Supervisor, analytics instrumentation and GitHub control-plane work.

## Vercel policy
- `streamvista`: canonical production product.
- Other projects: classify as product surface, preview, experiment or archive after dependency mapping.
- Do not delete or redirect a project solely because it appears duplicate; first establish source, environment, domain, database, API and customer dependency.

## CEO/CTO release sequence
1. Map Vercel projects → GitHub branches/commits → domains → env contracts.
2. Lock canonical Supabase/Auth/payment path.
3. Build conversion-first pages for each revenue lane using existing components.
4. Make every CTA end in a measurable business outcome.
5. Verify Razorpay order → verification → webhook → ledger persistence before calling payment flow production-green.
6. Instrument Amplitude only from authoritative outcomes: lead, signup, qualification, checkout-start, payment-success, fulfillment, repeat/upsell.
7. Use revenue and conversion evidence to prioritize the next implementation.
8. Archive/deprecate redundant surfaces only after dependency proof.

## Definition of meaningful
A project is meaningful only if it has at least one of: revenue generation, qualified lead capture, customer fulfillment, retention/upsell, operational cost reduction, or verified intelligence/control-plane value.

## Non-negotiables
Never rebuild; always compose. No fake analytics, fake revenue, fake AI success or uncertified production claims. No destructive cleanup before dependency mapping.
