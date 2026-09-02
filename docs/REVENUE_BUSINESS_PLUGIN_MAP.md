# STREAMVISTA — REVENUE & BUSINESS PLUGIN MAP

## Purpose

Canonical map for the StreamVista business and revenue operating stack.

This document maps business functions to connected/available tools. It is an architecture reference, not proof that every integration is fully wired or production-ready.

## Core Revenue Chain

Lead Discovery
→ Lead Enrichment
→ CRM / Sales Pipeline
→ Outreach & Follow-up
→ Offer / Deal
→ Payment Collection
→ Customer / Order Record
→ Delivery
→ Analytics / Retention

## Business Tool Map

| Function | Tool | Role | Status / Rule |
|---|---|---|---|
| Lead discovery & enrichment | Clay | Prospect discovery and enrichment | Connected/available; verify plan limits before scale |
| CRM / companies / contacts | HubSpot | Customer and sales pipeline management | Connected/available; free-first |
| CRM / deals | Attio | Contacts, companies and deal workflow | Connected/available; free-first |
| Sales CRM | Close | Calls, email, SMS and sales pipeline | Connected/available; plan limits to be verified |
| Transactional email | Resend | Application and customer email delivery | Connected/available; free-first |
| Payments | Razorpay | Customer payment collection and billing events | Connected/available; transaction fees may apply |
| Product analytics | PostHog | Funnel, product and conversion analytics | Connected/available; free-first |
| Product analytics | Amplitude | Product and conversion analytics | Connected/available; free-first |
| Work management | ClickUp / Linear / Asana | Sales/product execution and task management | Connected/available |
| AI | OpenAI Platform | AI runtime and automation | Usage-based; not classified as subscription-free |
| Research | Exa | AI/web research | Connected/available; verify allowance |
| Web/app hosting | Vercel | Application hosting and deployments | Connected/available; free-first |
| Business database | Supabase | Auth, database, storage and server functions | Connected/available; free-first |
| Business email | Hostinger Mail | Business mailbox infrastructure | Connected/available |
| Source control | GitHub | Canonical source, PRs and CI/CD | Canonical source of truth |
| Product design | Figma | UI/UX and product design | Connected/available; free-first |
| Automation | YepCode | Custom automation and backend tools | Connected/available; verify plan limits |

## Crayons Bridge Revenue Flow

Creator
→ Content / Rights Submission
→ Rights Verification
→ Buyer Discovery
→ Buyer Qualification
→ Deal Room
→ License Negotiation
→ Offer / Agreement
→ Razorpay Collection
→ Supabase Deal / Payment Record
→ Content Delivery
→ Revenue / Conversion Analytics

## StreamVista Business Operating Rules

1. Prefer connected tools already available before adding new services.
2. Prefer free tiers and open-source components for initial build.
3. Do not introduce a mandatory monthly/yearly subscription dependency unless there is a demonstrated business need.
4. Never commit API keys, service-role keys, webhook secrets, OAuth tokens, passwords, or private credentials.
5. A connector being available does not prove that an end-to-end integration is implemented.
6. Revenue readiness requires verified Lead → Sale → Payment → Record → Delivery flow.
7. GitHub `main` remains the canonical source for deployable application changes.

## Current Implementation Boundary

This file records the intended business/revenue architecture. Actual production readiness must still be established through code, environment, database/RLS, payment webhook, email, and end-to-end verification.
