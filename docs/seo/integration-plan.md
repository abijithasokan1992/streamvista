# StreamVista — AI SEO Metadata Implementation Milestones

## M0 — Repository & Architecture Baseline

**Owner:** Engineering  
**Due:** September 1, 2026  
**Dependency:** Existing `main` branch

- Inspect existing Film/Series models.
- Identify content creation and public watch pages.
- Identify existing SEO implementation.
- Identify Supabase fields and APIs.
- Confirm integration points.
- Establish rollback path.

**Acceptance:** No duplicate content architecture and all integration points identified.

---

## M1 — SEO Engine Foundation

**Owner:** Engineering  
**Due:** September 1, 2026  
**Status:** Complete

Implement:

```text
apps/web/app/lib/seo/
├── metadata.ts
└── README.md
```

Supports:

- Meta titles
- Meta descriptions
- Keywords
- Canonical URLs
- Open Graph
- Twitter metadata
- Schema.org JSON-LD
- Movie/Series/Documentary/Music/Show types

**Commit:** `bf9d37cca873d988f9b5486d4c0743743bb69763`

**Acceptance:** P0 SEO engine tests pass 100%.

---

## M2 — Content-to-SEO Integration

**Owner:** Frontend + Backend Engineering  
**Due:** September 2, 2026  
**Dependencies:** M0, M1

Connect existing content data to:

```text
Content
   ↓
SEO Input Builder
   ↓
generateSEOMetadata()
```

Map:

```text
title
contentType
genre
language
year
synopsis
focusKeyword
image
canonicalUrl
```

**Acceptance:** Valid test content generates SEO metadata with zero mapping errors.

---

## M3 — Dynamic Public Page Metadata

**Owner:** Frontend Engineering  
**Due:** September 2, 2026  
**Dependency:** M2

Automatically apply:

```text
<title>
description
canonical
og:title
og:description
og:type
twitter:title
twitter:description
```

**Acceptance:**

- 100% of tested public pages contain required metadata.
- Duplicate title tags = 0.
- Missing canonical URLs = 0.
- Broken canonical URLs = 0.

---

## M4 — Structured Data

**Owner:** Frontend + SEO Engineering  
**Due:** September 3, 2026  
**Dependencies:** M2, M3

Implement:

```text
Movie
TVSeries
MusicRecording
CreativeWork
```

**Acceptance:**

- Valid JSON-LD = 100%.
- Fabricated metadata = 0.
- Invalid schema = 0.

---

## M5 — SEO Management UI

**Owner:** Frontend Engineering  
**Due:** September 4, 2026  
**Dependency:** M2

Add:

```text
[Generate SEO]
[Regenerate]
[Save]
```

Allow editing of:

- Meta title
- Meta description
- Focus keyword
- Canonical URL

Display SEO health indicators.

**Acceptance:**

```text
Generate → Review → Edit → Save → Reload
```

works successfully with no critical content-workflow regression.

---

## M6 — SEO Metadata Persistence

**Owner:** Backend / Supabase Engineering  
**Due:** September 4, 2026  
**Dependency:** M5

Persist approved metadata:

```text
seo_title
seo_description
seo_keywords
canonical_url
og_title
og_description
og_image
seo_schema
seo_generated_at
seo_version
```

Reuse existing fields where possible.

**Acceptance:**

- Persistence success = 100%.
- Data loss = 0.
- Wrong-record association = 0.

---

## M7 — Optional AI SEO Generation

**Owner:** AI / Backend Engineering  
**Due:** September 5, 2026  
**Dependencies:** M2, M5, M6

Implement:

```text
Content
   ↓
AI Generator
   ↓
Validation
   ↓
SEO Engine
   ↓
Persistence
```

Fallback:

```text
AI unavailable
      ↓
Deterministic SEO generator
```

**Acceptance:**

- AI success handled = 100%.
- AI failure handled = 100%.
- Fallback success = 100%.
- Browser-exposed AI secrets = 0.

---

## M8 — AI Cost Control

**Owner:** Backend Engineering  
**Due:** September 5, 2026  
**Dependency:** M7

Generate metadata only when:

- Content is created.
- Important SEO fields change.
- User manually requests regeneration.

Reuse saved metadata otherwise.

**Acceptance:**

- Unnecessary AI calls = 0.
- Expected regeneration behavior = 100%.

---

## M9 — Sitemap Integration

**Owner:** Backend / SEO Engineering  
**Due:** September 6, 2026  
**Dependencies:** M3, M6

Include:

```text
Published public content
```

Exclude:

```text
Draft
Private
Restricted
Deleted
```

**Acceptance:**

- Eligible content included = 100%.
- Ineligible content included = 0%.
- Duplicate sitemap URLs = 0.
- Canonical/sitemap mismatch = 0.

---

## M10 — Automated Build & Regression Gate

**Owner:** Engineering  
**Due:** September 6, 2026  
**Dependencies:** M1–M9

Run:

```text
npm run typecheck
npm run build:web
npm run build:api
npm run build
```

**Acceptance:**

```text
TypeScript errors = 0
Build errors      = 0
Critical warnings = 0
```

---

## M11 — Full SEO QA

**Owner:** SEO QA + Product/Content  
**Due:** September 7, 2026  
**Dependency:** M10

Test:

```text
Movie
Series
Documentary
Music
Show
Long title
Long description
Missing genre
Missing image
Missing language
Special characters
Malayalam
English
```

Test at least **10 representative public pages**.

**Acceptance:** P0 test pass rate = 100%.

---

## M12 — Vercel Preview Release

**Owner:** Deployment / Engineering  
**Due:** September 7, 2026  
**Dependencies:** M10, M11

Deployment:

```text
GitHub main
     ↓
Vercel Preview
     ↓
SEO verification
```

Verify:

- Page loading
- Authentication
- Content rendering
- Metadata
- JSON-LD
- Sitemap
- Browser console

**Acceptance:**

```text
Vercel status = READY
Critical runtime errors = 0
SEO QA failures = 0
```

---

## M13 — Production Release

**Owner:** Product Owner + Engineering  
**Due:** September 8, 2026  
**Dependency:** M12

Release:

```text
GitHub main
     ↓
Vercel
     ↓
streamvista.in
```

Required sign-offs:

```text
Engineering ✓
SEO QA      ✓
Product     ✓
```

**Acceptance:**

```text
Build success              = 100%
P0 tests                   = 100% PASS
Public pages with SEO     = 100%
Broken canonical URLs     = 0
Invalid JSON-LD            = 0
Duplicate metadata         = 0
Private/draft indexed      = 0
Critical security issues   = 0
Critical regressions       = 0
```

---

# Final Delivery Flow

```text
M0
 ↓
M1
 ↓
M2
 ├──→ M3 → M4
 └──→ M5 → M6 → M7 → M8
              │
M3 + M6 ──────┴──→ M9
                      ↓
                     M10
                      ↓
                     M11
                      ↓
                     M12
                      ↓
                     M13
```

## Definition of Done

The implementation is complete only when:

```text
Create Content
      ↓
Generate SEO
      ↓
Review / Edit
      ↓
Save
      ↓
Publish
      ↓
Public Page
      ↓
Meta + OG + Twitter
      ↓
JSON-LD
      ↓
Canonical
      ↓
Sitemap
      ↓
Vercel Production
      ↓
Live Verification
      ↓
All Sign-offs
```

**Production target:** September 8, 2026.

**Release rule:** No milestone is considered complete without its measurable acceptance criteria and required evidence.
