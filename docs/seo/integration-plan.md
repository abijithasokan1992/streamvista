# StreamVista — AI SEO Metadata Integration Plan

## Objective

Integrate the StreamVista SEO metadata engine into the existing content workflow for movies, series, documentaries, music and shows, using the existing application architecture and avoiding duplicate content systems.

## Current Baseline

Repository: `abijithasokan1992/streamvista`
Branch: `main`

SEO engine foundation already committed under:

```text
apps/web/app/lib/seo/
├── metadata.ts
└── README.md
```

Foundation commit:

`bf9d37cca873d988f9b5486d4c0743743bb69763`

The foundation provides deterministic SEO title/description generation, keywords, canonical URL, Open Graph, Twitter metadata and Schema.org JSON-LD support without requiring an AI provider.

## Owners

| Area | Owner |
|---|---|
| Product / Release | StreamVista Founder / Product Owner |
| Engineering | StreamVista Engineering |
| Frontend | StreamVista Engineering — Frontend |
| Backend | StreamVista Engineering — Backend |
| AI | StreamVista Engineering — AI |
| Database | StreamVista Engineering — Supabase |
| SEO QA | StreamVista Product + Engineering |
| Content QA | StreamVista Product / Content Team |
| Deployment | StreamVista Engineering / DevOps |

## Milestones, Owners, Dependencies and Due Dates

| Milestone | Deliverable | Primary Owner | Dependencies | Due Date |
|---|---|---|---|---|
| M0 | Repository and architecture baseline | Engineering | `main` branch | 2026-09-01 |
| M1 | SEO engine foundation | Engineering | M0 | Complete — 2026-09-01 |
| M2 | Content to SEO integration | Frontend + Backend | M0, M1 | 2026-09-02 |
| M3 | Dynamic page metadata | Frontend | M2 | 2026-09-02 |
| M4 | Structured data | Frontend + SEO QA | M2, M3 | 2026-09-03 |
| M5 | SEO management UI | Frontend | M2 | 2026-09-04 |
| M6 | Metadata persistence | Backend / Supabase | M5 | 2026-09-04 |
| M7 | Optional AI generation | AI / Backend | M2, M5, M6 | 2026-09-05 |
| M8 | AI cost-control layer | Backend | M7 | 2026-09-05 |
| M9 | Sitemap integration | Backend / SEO | M3, M6 | 2026-09-06 |
| M10 | Automated build and regression gate | Engineering | M1–M9 | 2026-09-06 |
| M11 | Full SEO QA | SEO QA + Content QA | M10 | 2026-09-07 |
| M12 | Vercel preview | DevOps / Engineering | M10, M11 | 2026-09-07 |
| M13 | Production release | Product + Engineering | M12 | 2026-09-08 |

## Measurable Acceptance Criteria

### M2 — Content Integration

Test at least:

- 3 movies
- 3 series
- 1 documentary
- 1 music/show record

Targets:

```text
Valid records generating metadata = 100%
Optional-field failures = 0
Missing-required-field crashes = 0
Duplicate canonical URLs in test set = 0
```

### M3 — Dynamic Metadata

For every tested public page:

```text
<title> = present
meta description = present
canonical = present and valid
og:title = present
og:description = present
og:type = present
twitter:title = present
twitter:description = present
```

Targets:

```text
Public test pages with SEO metadata = 100%
Duplicate title tags = 0
Duplicate descriptions = 0
Missing canonical URLs = 0
Broken canonical URLs = 0
```

### M4 — Structured Data

Expected mappings:

```text
Movie → Movie
Series → TVSeries
Music → MusicRecording
Other → CreativeWork
```

Targets:

```text
Public pages with JSON-LD = 100%
Valid JSON-LD = 100%
Fabricated values = 0
Unnecessary undefined fields = 0
```

### M5 — SEO UI

Required workflow:

```text
Generate → Review → Edit → Save → Regenerate
```

Targets:

```text
Generate success ≥ 99%
Save success ≥ 99%
Manual editing = supported
Metadata lost after refresh = 0
Critical content-workflow regressions = 0
```

### M6 — Persistence

Targets:

```text
Persistence success = 100%
Data loss = 0
Wrong-record association = 0
Unintended regeneration = 0
```

### M7 — AI Layer

Two mandatory tests:

```text
AI available → AI generation → validation → save = PASS
AI unavailable → deterministic fallback → save = PASS
```

Targets:

```text
AI errors handled = 100%
Fallback success = 100%
Browser-exposed AI secrets = 0
Unvalidated AI output saved = 0
```

### M8 — Cost Control

Required behavior:

```text
First creation → generation allowed
Reload → no regeneration
Important SEO field change → regeneration allowed
Manual regenerate → regeneration allowed
```

Target:

```text
Unnecessary AI calls = 0
```

### M9 — Sitemap

Published public content must be included. Draft, private, restricted and deleted content must be excluded.

Targets:

```text
Eligible content included = 100%
Ineligible content included = 0%
Canonical/sitemap mismatches = 0
Duplicate sitemap URLs = 0
```

### M10 — Build and Regression Gate

Run:

```text
npm run typecheck
npm run build:web
npm run build:api
npm run build
```

Release threshold:

```text
TypeScript errors = 0
Build errors = 0
Critical warnings = 0
```

### M11 — SEO QA

Required test categories:

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
Malayalam text
English text
```

P0 test pass rate must be 100%.

### M12 — Vercel Preview

Evidence must include:

```text
GitHub commit SHA
Vercel deployment ID
Preview URL
Deployment status
Build status
Runtime status
```

Targets:

```text
Deployment = READY
Critical runtime errors = 0
SEO QA failures = 0
```

### M13 — Production Release

Production target:

`2026-09-08`

Final measurable gates:

```text
Build success = 100%
P0 test pass rate = 100%
Public pages with metadata = 100%
Broken canonical URLs = 0
Invalid JSON-LD = 0
Duplicate metadata = 0
Private/draft indexed = 0
Critical security issues = 0
Critical regressions = 0
```

## Test Evidence Standard

Every milestone marked `PASS` must have objective evidence.

Acceptable evidence:

- GitHub commit SHA
- Changed-file list
- Typecheck/build output
- Automated test results
- Browser/page-source verification
- UI screenshot
- Database migration/result
- Sitemap output
- JSON-LD validation
- Vercel deployment URL/status

A milestone must not be marked `PASS` from visual inspection or developer assertion alone.

## Sign-Off Matrix

| Gate | Engineering | SEO QA | Product | Release |
|---|:---:|:---:|:---:|:---:|
| M1 Foundation | ✓ | — | ✓ | — |
| M2 Integration | ✓ | ✓ | ✓ | — |
| M3 Metadata | ✓ | ✓ | ✓ | — |
| M4 JSON-LD | ✓ | ✓ | — | — |
| M5 SEO UI | ✓ | ✓ | ✓ | — |
| M6 Persistence | ✓ | — | ✓ | — |
| M7 AI | ✓ | ✓ | ✓ | — |
| M8 Cost Control | ✓ | — | ✓ | — |
| M9 Sitemap | ✓ | ✓ | — | — |
| M10 Build Gate | ✓ | — | — | — |
| M11 QA | ✓ | ✓ | ✓ | — |
| M12 Preview | ✓ | ✓ | ✓ | — |
| M13 Production | ✓ | ✓ | ✓ | GO |

## Evidence Register

| Milestone | Minimum evidence |
|---|---|
| M0 | Architecture/integration map |
| M1 | Foundation commit SHA |
| M2 | Content-to-SEO test results |
| M3 | Page-source metadata evidence |
| M4 | JSON-LD validation evidence |
| M5 | SEO UI screenshot + functional test |
| M6 | Persistence test evidence |
| M7 | AI success + fallback evidence |
| M8 | AI invocation/cost evidence |
| M9 | Sitemap inclusion/exclusion evidence |
| M10 | Typecheck/build output |
| M11 | SEO QA matrix |
| M12 | Vercel preview record |
| M13 | Production verification + sign-offs |

## Critical Blockers

Production release must stop if any of these occur:

1. Existing content creation breaks.
2. SEO metadata contains fabricated information.
3. AI failure causes a public page failure.
4. Private/draft content becomes publicly indexed.
5. Canonical URLs are incorrect.
6. JSON-LD is malformed.
7. TypeScript or build fails.
8. Vercel deployment is not READY.
9. Authentication/content workflows regress.
10. AI or database credentials are exposed to the browser.

## Release Principle

```text
Build → Validate → Preview → Verify → Deploy
```

The feature is not production-certified until engineering, SEO QA and product sign-off are complete and the deployed StreamVista pages pass live verification.

## Definition of Done

A content creator can:

```text
Create Film
    ↓
Enter content information
    ↓
Generate SEO
    ↓
Review/edit metadata
    ↓
Save
    ↓
Publish
    ↓
Open public page
    ↓
Verify title + description + canonical
    ↓
Verify OG/Twitter metadata
    ↓
Verify JSON-LD
    ↓
Verify sitemap
```

Business target:

> Prepare SEO metadata for one normal movie/series page in under 2 minutes, including review and manual adjustment.
