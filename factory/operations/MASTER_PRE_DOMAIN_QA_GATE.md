# StreamVista FACTORY — Master Pre-Domain QA Gate

**Policy status:** MANDATORY
**Scope:** Every StreamVista FACTORY-built application, product, service surface, module and web page.
**Applies before:** production domain mapping, DNS cutover, production promotion, or declaring a release `live`.

## Master rule

**NO DOMAIN MAPPING BEFORE FULL APP-PAGE COMPLETION AND QA PASS.**

A product must not be connected to its real production domain until every intended production page and critical workflow is implemented, wired to its real backend where required, tested, and supported by release evidence.

QA is the software equivalent of a final QC master: users do not see the gate; they experience the quality it protects.

## Mandatory release sequence

`Source complete -> Build -> Route inventory -> Functional QA -> Visual QA -> Responsive QA -> Browser QA -> Backend/API/Auth verification -> Performance -> Accessibility -> Security -> Release evidence -> DOMAIN MAP -> Live-domain verification`

Domain mapping is a **promotion step**, not a testing shortcut.

## Gate 1 — App/page completion

Before domain mapping:

- Every intended production route/page must exist.
- No placeholder, blank, demo-only or broken production page is allowed.
- Navigation must reach the correct destinations.
- Buttons, links, forms and primary CTAs must work.
- Required loading, empty, success and error states must exist.
- Authenticated/protected pages must enforce the correct access boundary.
- Real backend/API/database/storage wiring must be verified where the product requires it.
- Mock data must not be presented as real production data.

## Gate 2 — Route smoke test

Test the complete production route inventory, including as applicable:

- Home / landing
- Authentication / callback / logout
- Product and service pages
- Dashboards
- Admin / founder / operator surfaces
- Creator / buyer / customer surfaces
- Settings / profile
- Legal / privacy / terms
- Error / 404 / unavailable states
- API health/status routes
- `robots.txt`
- `sitemap.xml`

Any wrong route, redirect loop, blank page, server error or missing required route is a release blocker.

## Gate 3 — Visual snapshots

Capture and review evidence for representative pages and critical workflows at:

- Mobile
- Tablet
- Desktop
- Large desktop / 4K where relevant

Check for:

- Layout breaks
- Overflow/cropping
- Misalignment
- Unreadable typography
- Broken images/icons
- Incorrect stacking/z-index
- Inconsistent spacing
- Modal/drawer issues
- Visual regressions against the approved baseline

## Gate 4 — Responsive and browser QA

Verify responsive behavior across the supported matrix, including the current production-relevant versions of:

- Chrome
- Edge
- Safari
- Mobile Safari
- Android Chrome

No critical workflow may depend on one desktop browser only.

## Gate 5 — Interaction and workflow QA

Verify all release-critical interactions, including as applicable:

- Buttons and links
- Forms and validation
- Authentication and authorization
- Upload/download
- Search/filter/sort
- CRUD operations
- Payments/invoices where enabled
- Notifications
- Media playback/processing
- External integrations
- Error recovery

A visually correct page with a broken workflow does not pass.

## Gate 6 — Performance

Release must be blocked when critical pages or interactions are unacceptably slow or unstable.

Check at minimum:

- Initial page loading
- Client bundle/heavy asset regressions
- Image/media loading
- Animation smoothness
- Slow-network fallback
- Loading states
- Major console/runtime errors

Decorative animation must never block usability.

## Gate 7 — Accessibility

Check at minimum:

- Readable text
- Keyboard navigation for critical workflows
- Focus visibility
- Form labels
- Semantic controls
- Contrast
- Reduced-motion behavior where animation is used

Critical accessibility failures block promotion.

## Gate 8 — Security and production boundary

Verify at minimum:

- No secrets/API keys exposed in browser bundles or repository output
- Private routes are protected
- Server-only credentials stay server-side
- Authorization is enforced server-side where required
- Security headers/configuration are appropriate
- Production environment variables point to the intended production services
- No accidental public storage/data exposure
- No debug/admin bypass remains enabled

## Gate 9 — Release evidence

Every promoted release must record enough evidence to reproduce the decision:

- Repository
- Commit SHA / release ref
- Build result
- Route test result
- Functional test result
- Visual screenshots/snapshots
- Responsive/browser result
- Performance result
- Accessibility result
- Security result
- Backend/API/Auth verification result where applicable
- Release timestamp

**No evidence = no completion claim.**

## Gate 10 — Domain mapping

Only after Gates 1–9 pass may the application be mapped to its real production domain.

Permitted transition:

`QA PASS -> Domain/DNS mapping -> TLS/SSL ready -> Live-domain smoke test -> Critical workflow verification -> status = live`

Blocked transition:

`Incomplete/untested app -> Domain mapping`

## Post-domain live verification

After the domain is mapped, verify the real public production URL again:

- DNS resolution
- HTTPS / certificate
- Canonical redirects
- Home page
- Critical routes
- Auth callback/redirect URLs
- Backend/API connectivity
- Assets/CDN
- Mobile and desktop smoke test
- No production-only console/server errors

The release becomes `live` only after this post-domain verification passes.

## Factory enforcement rule

All FACTORY agents, builders, CI workflows, release checklists and future product templates must inherit this policy.

When a gate fails:

`FAIL -> Fix smallest verified defect -> rerun affected gate -> rerun release smoke set -> continue only when PASS`

Do not hide failures by removing tests, weakening checks, mapping the domain early, or calling preview evidence production evidence.

## Definition of done

A FACTORY application is production-ready only when:

1. Intended production pages are complete.
2. Required real integrations are wired and verified.
3. Mandatory QA gates pass.
4. Evidence is recorded.
5. Real domain is mapped only after the pass.
6. The mapped production domain is verified again.

This is the default master release rule for the StreamVista Software FACTORY unless the Founder explicitly replaces it with a newer documented policy.
