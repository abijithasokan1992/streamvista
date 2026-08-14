# Implementation Status

> Historical sections below predate the current Supabase production-candidate architecture and are retained only as implementation history. Current release truth must be verified from the repository, canonical Supabase project and release evidence.

## 2026-08-14 — Commercial rights flexibility work unit

- **Branch:** `chatgpt/commercial-flexibility-model`
- **Purpose:** model StreamVista as a flexible creator/studio/rights-holder/buyer/licensing/syndication/distribution operating layer without overloading authentication roles.
- **Created:** `docs/COMMERCIAL_RIGHTS_OPERATING_MODEL.md`
- **Created:** `src/types/commercialOperatingModel.ts`
- **Created:** `docs/COMMERCIAL_MODELS_AND_REVENUE_WATERFALLS.md`
- **Created:** `src/types/commercialDealEconomics.ts`
- **Created:** `server/commercialEconomics.mjs`
- **Created:** `server/commercial-economics.test.mjs`
- **Commercial lifecycle:** `CREATE -> PRODUCE -> REPRESENT -> VERIFY -> PACKAGE -> MARKET -> MATCH -> NEGOTIATE -> LICENSE -> SYNDICATE -> DISTRIBUTE -> DELIVER -> MONETISE -> SETTLE`
- **Verification tracks:** legal, creative/documentation, technical/delivery, customer/human scrutiny, audit/evidence, AI processing/reporting.
- **Gate rule:** every required check for a transaction must be `verified` or explicitly `not_applicable` before the stage can pass.
- **Human authority:** AI can extract, classify, match, draft, compare, score and report; AI cannot become the final authority for rights ownership, binding terms, signatures, buyer acceptance, payments or settlements.
- **Flexibility rule:** Studio, distributor, syndicator, licensor and similar business identities are modelled as scoped commercial personas/capabilities, not permanent login roles.
- **Commercial taxonomy:** SVOD, AVOD, TVOD rental, EST purchase, FAST, FVOD, TV, IPTV, theatrical/non-theatrical, inflight, hospitality, institutional, educational, mobile/telco, physical/digital and other contract-defined exploitation models.
- **Pricing taxonomy:** fixed licence, MG, MG + revenue share, revenue share, outright assignment, distribution commission, syndication commission, transaction commission, service fee, subscription, acquisition fee, cost-plus, hybrid and custom.
- **Default commercial position:** 35% StreamVista / Crayons Pictures and 65% rights holder where the signed deal uses the default commission basis; deal-specific agreements may override it.
- **Revenue waterfall:** verified gross -> approved deductions -> net receipts -> contractual recoupment -> net distributable -> commission/share -> settlement.
- **Financial implementation:** calculations use integer minor currency units, validate commission ranges, block deductions above gross revenue, support recoupment and calculate ROI separately from settlement accounting.
- **Supabase inspection:** current canonical database already contains title, rights, screening, marketplace-deal, delivery, payment and audit primitives; this branch does not apply any database migration.
- **Focused verification:** new commercial economics tests passed 5/5 in isolated local execution; the TypeScript economics taxonomy passed standalone `tsc --noEmit` syntax/type validation.
- **Full repository verification:** pending GitHub PR CI / repository-capable runner. The local container could not clone GitHub because outbound DNS/network access was unavailable, so no full `npm ci`, repository test suite or production build is claimed from the container.
- **Production actions:** none.
- **Data mutation:** none; Supabase was inspected read-only.
- **Deployment:** none.
- **Secrets:** none added or changed.

## Historical Phase 7 (Documentation Setup)

- **Historical branch:** `main`
- **Historical latest commit:** `b7147ff feat: complete local mock implementation phases 1-6` (Pre-docs commit)
- **Completed features at that historical point:**
  - Vite + React + TypeScript base configuration.
  - Tailwind CSS setup with cinematic enterprise design system.
  - Core role-based authentication and routing with mock data layer.
  - Floating Mock Role Switcher for local development.
  - Placeholders for all requested pages (Mission Control, Titles, Drafts, Uploads, Creator, Buyer, Screenings, QC, Legal, Payments, Analytics, Campaigns, Users, Settings).
  - Firebase rules and environment structure definitions.
- **Incomplete features recorded at that historical point:**
  - Fully interactive UI for managing titles/drafts.
  - Real Firebase integration.
  - Live data import.
- **Historical files created:**
  - `docs/IMPLEMENTATION_STATUS.md`
  - `docs/ROUTE_MATRIX.md`
  - `docs/ROLE_PERMISSION_MATRIX.md`
  - `docs/FIREBASE_REQUIREMENTS.md`
  - `docs/MIGRATION_REQUIREMENTS.md`
  - `docs/TEST_MATRIX.md`
- **Historical commands recorded:**
  - `New-Item -ItemType Directory -Force -Path "docs"`
  - `git log -1`
- **Historical verification:**
  - Typecheck: Pass (`tsc -b`)
  - Lint: Pass (relaxed local-demo rules)
  - Test: manual route-protection verification
  - Build: Pass (`vite build`)

## Historical production backend release-candidate note

- Mock auth/database adapters were replaced by same-origin API adapters at that stage.
- Server used scrypt password hashing, HttpOnly SameSite sessions, persistent SQLite, RBAC and append-only audit events.
- Health and database readiness endpoints were available.
- Production deployment and live E2E remained evidence gates; code/build success alone was not a live claim.
