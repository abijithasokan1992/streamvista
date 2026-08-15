# Product Design → Build Supervisor Handoff

## Purpose

Product Design is a StreamVista design department/workflow inside ChatGPT, not a separate StreamVista application.

- **Product Design owns:** what the product should look like, feel like, and how users move through it.
- **StreamVista Build Supervisor owns:** safe engineering, integration, testing, verification, and release preparation.
- **GitHub owns implementation truth:** approved design intent is not considered implemented until repository and runtime evidence prove it.

The Instagram-style "UI/UX Design Brief" is one input inside this system, not the whole Product Design workflow.

## Canonical workflow

1. **Inspect GitHub first**
   - Identify the real repository, current `main`, active routes, components, design tokens, assets, APIs, auth/RBAC, and existing reusable capabilities.
   - Never redesign or rebuild a capability before checking whether verified StreamVista code already provides it.

2. **Research when useful**
   - Review current high-quality products, services, interaction patterns, and relevant competitors when external comparison materially improves the decision.
   - Research informs StreamVista; it does not replace StreamVista brand, business, accessibility, security, or revenue requirements.

3. **Product Design**
   - Product idea / problem
   - UX research or current-flow audit when needed
   - User flow and information architecture
   - Exactly three meaningful visual directions when visual exploration is required
   - Founder/product selection of a visual target
   - Responsive prototype
   - Design QA against the selected visual target

4. **Design handoff**
   The handoff must identify:
   - product/feature and target route(s)
   - intended user and primary outcome
   - approved visual source (screenshot, Figma frame, mockup, prototype, or equivalent)
   - required UI states: loading, empty, success, error, permission/approval, disabled, and destructive states where relevant
   - responsive behavior
   - interaction and navigation behavior
   - design tokens, logos, icons, imagery, and reusable components
   - accessibility requirements (WCAG 2.1/2.2 AA baseline, keyboard/remote navigation, focus, labels, contrast)
   - acceptance criteria and explicit non-goals

5. **Build Supervisor implementation**
   - Search → Reuse → Wire → Verify → Ship
   - Create a dedicated branch for substantive changes.
   - Reuse approved design/system components before generating new ones.
   - Preserve Supabase/Auth/RBAC/security boundaries.
   - Add or update success, denial, error, and role tests.
   - Run available typecheck, lint, tests, production build, and security checks.
   - Compare the rendered implementation with the approved visual target before handoff is considered complete.

6. **Promotion gate**
   - Code generated ≠ implemented.
   - Implemented ≠ tested.
   - Tested ≠ deployed.
   - Deployed ≠ production-ready.
   - Production-ready requires live runtime evidence against the approved target and business flow.

## StreamVista boundaries

### Supabase

The canonical StreamVista backend project is `uakpqqardziifcwzvgfx`. UI work must never silently fall back to another Supabase project. Auth, roles, buyer approval, rights, payments, and privileged transitions remain server/database enforced.

### Vercel

Vercel is the canonical deployment target for the active StreamVista web release path. Production environment changes, deployment promotion, or domain changes require explicit Founder approval in the current execution context.

### Hostinger Mail

Hostinger Mail is a communication execution connector inside StreamVista, not a separate product. Product Design may design mail/communication surfaces, but credentials, mailbox mutation, sends, webhook configuration, and automation must remain server-side and auditable.

## Product Design execution environment

When the Product Design plugin requires its full visual workflow, run that visual design work in ChatGPT Work mode. Standard chat may coordinate the brief, repository state, engineering handoff, and implementation governance, but it must not claim visual prototype/design-QA completion without the Product Design visual tooling and evidence.

## Required final evidence

A completed Product Design → Build Supervisor cycle should report:

- approved design target
- repository / branch / commit / PR
- reused capabilities and newly generated gaps
- test/build/security results
- design-QA result
- Supabase/Vercel/Hostinger integration status as applicable
- deployment URL and runtime health only when actually deployed and verified
- exact remaining blockers and approval gates

## Permanent rule

**Product Design decides and validates the experience. Build Supervisor composes and verifies the implementation. GitHub and live runtime evidence decide what is actually true.**
