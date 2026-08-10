# StreamVista Intelligence Engine

Status: **designed / implementation not yet verified**

Canonical home: `factory/knowledge/STREAMVISTA_INTELLIGENCE_ENGINE.md`

## Purpose

Build a StreamVista-native market, buyer, distributor, OTT, studio and rights intelligence layer that converts public business signals into evidence-backed, revenue-oriented actions for StreamVista and Crayons Bridge.

This is an independent implementation. It may learn from publicly observable product patterns and public documentation, but it must not copy private source code, obtain secrets, bypass authentication/access controls, evade anti-bot protections, or depend on unauthorized private APIs.

## Core pipeline

```text
PUBLIC / AUTHORISED SOURCES
        ↓
Collect / Crawl / Ingest
        ↓
Normalize + Deduplicate
        ↓
Snapshot
        ↓
Change Detection
        ↓
Signal Extraction
        ↓
Company / Buyer / Rights Context
        ↓
Cross-Signal Correlation
        ↓
AI Interpretation
        ↓
Confidence Score
        ↓
Business Impact Score
        ↓
Recommended Action
        ↓
Founder / Specialist Command Centers
        ↓
Authorised Agent Execution
        ↓
Human approval gate where required
        ↓
Evidence + Audit Log
```

## Intelligence pillars

1. Company overview — identity, size, ownership/stage and market context.
2. Website intelligence — public-page changes, positioning, pricing/packaging and technology clues.
3. News & media — announcements, partnerships, acquisitions, launches and executive statements.
4. Social intelligence — public brand/executive positioning and campaign themes.
5. GTM intelligence — sales motion, packaging, market-entry and positioning signals.
6. Traffic / demand signals — available public or licensed traffic/demand indicators.
7. Product & technology — launches, changelogs, integrations and platform changes.
8. People & hiring — public leadership changes, hiring patterns and role concentration.
9. Business & finance — public funding, revenue indicators, partnerships and expansion signals.
10. Review / community intelligence — public reviews and community discussions where terms permit collection.
11. OTT / buyer intelligence — acquisition appetite, commissioning activity, territory and genre demand.
12. Rights / licensing intelligence — rights windows, territory opportunities, catalogue gaps and licensing signals.
13. Content-demand intelligence — language, genre, format, runtime and audience demand indicators.

## StreamVista-specific correlation

The engine must not stop at raw alerts. It should correlate multiple independent signals into an explainable business conclusion.

Example:

```text
Regional-content hiring increases
+ India commissioning announcement
+ Malayalam campaign activity rises
+ Buyer catalogue gap detected
+ StreamVista has matching verified titles
        ↓
High-confidence acquisition opportunity
        ↓
Rank matching titles
        ↓
Route to Buyer Intelligence + Rights + Sales agents
        ↓
Prepare evidence-backed outreach recommendation
```

## Canonical entities

- Company
- OTT platform
- Buyer
- Distributor
- Broadcaster
- Studio
- Producer / rights holder
- Executive / buyer contact
- Title / catalogue item
- Territory
- Language
- Genre / format
- Rights window
- Source
- Snapshot
- Signal
- Evidence
- Intelligence conclusion
- Recommendation
- Action

## Minimum signal record

Each signal should retain at least:

- `signal_id`
- `entity_id`
- `signal_type`
- `source_url`
- `source_type`
- `observed_at`
- `previous_snapshot_ref` when applicable
- `current_snapshot_ref`
- `evidence_excerpt_or_hash`
- `confidence_score`
- `magnitude_score`
- `business_impact_score`
- `territory`
- `language`
- `rights_relevance`
- `content_demand_relevance`
- `recommended_action`
- `agent_route`
- `approval_required`
- `audit_ref`

## Scoring model

Scores must remain explainable and evidence-backed.

```text
confidence = source_quality × corroboration × recency × extraction_reliability
impact = strategic_relevance × revenue_potential × urgency × catalogue_match
priority = confidence × impact
```

Weights may evolve, but every recommendation must expose why it received its score.

## Existing StreamVista components to reuse

Do not create duplicate systems. Compose from the existing inventory where implementation exists:

- Business Intelligence Agent
- Workspace Intelligence
- OTT Buyer Intelligence
- Content Acquisition
- Rights Discovery
- Buyer Matching
- Buyer Agent
- Rights Agent
- Territory Agent
- Catalog Agent
- CRM / Lead Qualification / Sales agents
- Communication Center / Email / Follow-up agents
- StreamVista Core MCP
- Agent Runtime / Agent Registry
- AI Command Center
- Approval Layer / Audit Layer

Missing or unverified components must remain `draft`, `planned`, `prototype`, or `built` until runtime evidence proves otherwise.

## Tool classes

### Collection
- standards-compliant HTTP fetcher
- sitemap / RSS / feed reader
- public-page crawler
- browser renderer only when necessary and permitted
- authorised API connectors
- licensed data-provider connectors

### Processing
- parser / extractor
- entity resolver
- deduplicator
- snapshot store
- diff engine
- change classifier
- signal extractor
- evidence linker

### Intelligence
- correlation engine
- confidence scoring
- impact scoring
- buyer / content matching
- rights / territory relevance scoring
- recommendation engine

### Execution
- MCP tool router
- specialist agent routing
- CRM / task creation
- communication drafting
- founder approval workflow
- audit/evidence writer

## Guardrails

1. Public or explicitly authorised data only.
2. Respect source terms, robots directives where applicable, rate limits and applicable law.
3. No authentication bypass, credential harvesting, secret extraction or private API access.
4. No anti-bot circumvention designed to defeat access controls.
5. No claim that a signal is verified unless evidence exists.
6. High-risk commercial, legal, contractual, payment and rights actions require the existing approval rules.
7. Personally identifiable data must be minimized and handled under the appropriate privacy/compliance policy.
8. Every automated action must be attributable through the audit layer.

## Command Center surfaces

### Founder Intelligence
- top opportunities
- top risks
- major buyer/OTT movements
- revenue-impact ranking
- evidence drill-down
- recommended next action

### Buyer Intelligence
- acquisition signals
- buyer appetite
- territory/language/genre demand
- contact/company context
- matching StreamVista titles

### Content & Rights Intelligence
- catalogue gaps
- rights opportunities
- territory conflicts/windows
- title-to-buyer fit
- licensing readiness

### Sales / Revenue Intelligence
- qualified opportunity
- expected value / urgency
- recommended pitch
- follow-up state
- deal / payment linkage

## Delivery outputs

- Intelligence cards
- Company / buyer profiles
- Change timeline
- Daily / weekly briefs
- Threshold alerts
- Opportunity queue
- Catalogue-match recommendations
- Evidence-backed outreach recommendations
- Founder approval tasks
- Audit trail

## Build sequence

### P0 — Evidence foundation
1. Source registry
2. Fetch/crawl policy
3. Snapshot + hash storage
4. Diff/change detection
5. Signal schema
6. Evidence linking
7. Deduplication

### P1 — Media intelligence
1. OTT/buyer/company entity resolution
2. News/website/hiring/product signal extraction
3. Territory/language/genre enrichment
4. Buyer appetite model
5. Catalogue match
6. Rights relevance

### P2 — AI correlation
1. Cross-signal correlation
2. Confidence scoring
3. Impact/revenue scoring
4. Explainable recommendations
5. Founder and specialist routing

### P3 — Controlled execution
1. MCP actions
2. CRM/task/communication routing
3. Approval gates
4. Audit logging
5. Golden Baseline verification

## Production gate

This design is **not** a production-live claim. Production promotion requires the repository's Mandatory Pre-Domain QA Gate and evidence for source collection, data integrity, permissions, security, agent routing, approval enforcement, audit logging and end-to-end business workflows.

## Success criterion

The engine is successful when it converts external evidence into a specific, explainable and executable StreamVista action, for example:

```text
Buyer signal
→ demand hypothesis
→ evidence/corroboration
→ matching verified catalogue titles
→ rights/territory validation
→ opportunity score
→ authorised outreach recommendation
→ approval where required
→ deal workflow
→ revenue evidence
```
