# StreamVista Commercial Rights Operating Model

## Purpose

StreamVista is a filmmaker-led media rights, licensing, syndication and distribution operating layer for creators, studios, rights holders, buyers and approved partners.

The canonical business flow is:

`CREATE -> PRODUCE -> REPRESENT -> VERIFY -> PACKAGE -> MARKET -> MATCH -> NEGOTIATE -> LICENSE -> SYNDICATE -> DISTRIBUTE -> DELIVER -> MONETISE -> SETTLE`

Every stage is evidence-gated. AI may extract, classify, compare, score, draft and report, but AI never becomes the final authority for rights ownership, legal commitments, buyer acceptance, pricing commitments, payment release, publication, destructive actions or settlement approval.

## Core rule: 100% required-gate completion

"100% verified" means every checklist item that is required for that specific transaction has passed with evidence. It does not mean StreamVista guarantees that no future dispute can ever arise.

A stage can move forward only when all mandatory checks for that stage have one of these outcomes:

- `verified` - evidence has passed the required review.
- `not_applicable` - an authorised reviewer recorded why the check does not apply.

Any required item in `missing`, `conflict`, `expired`, `rejected`, `pending_human_review` or `unverified` blocks promotion.

## Flexible participant model

A person or organisation may hold more than one commercial persona. Authentication roles should not be used as the full business model.

Supported commercial personas include:

- Creator / Filmmaker
- Producer
- Production House / Studio
- Rights Holder / Licensor
- Sales Agent / Representative
- Distributor
- Syndicator / Aggregator
- OTT / FAST / TV / IPTV Buyer
- Broadcaster / Platform
- Localization / Delivery Partner
- Legal Reviewer
- Creative Reviewer
- Technical QC Reviewer
- Finance / Settlement Reviewer
- Founder / Final Approver

The same organisation may be a rights owner for one title, distributor for another title, and buyer for a third. Capabilities must therefore be title-scoped and agreement-scoped rather than permanently inferred from one login role.

## Rights model

Rights are stored and reviewed as structured grants, not as a single free-text field.

Each rights grant should capture:

- title / asset
- rights holder
- representation authority
- right type
- linear / non-linear / ancillary classification
- media / platform
- territory
- language
- exclusivity
- start date
- end date
- holdbacks / windows
- sublicensing authority
- syndication authority
- distribution authority
- localization authority
- commercial model
- existing encumbrances
- source agreement / evidence
- verification status
- reviewer
- verified timestamp

### Linear rights examples

- Broadcast television
- Satellite
- Cable
- IPTV
- FAST / scheduled streaming
- Other scheduled channel rights

### Non-linear rights examples

- SVOD
- AVOD
- TVOD
- VOD
- EST / electronic sell-through
- Catch-up
- On-demand digital exploitation

### Ancillary rights examples

Ancillary rights must be enabled only when expressly granted. They may include:

- Dubbing
- Subtitling / localization
- Remake / adaptation
- Inflight
- Hospitality
- Institutional / educational
- Non-theatrical
- Mobile / telco
- Promotional clip usage
- Other contractually defined ancillary exploitation

## Cross-cutting verification tracks

Every commercial stage is evaluated across six tracks.

### 1. Legal and rights track

Required checks can include:

- identity / entity verification
- authorised signatory verification
- creator / producer / licensor mandate
- chain of title
- copyright ownership or valid licence
- writer / script rights where relevant
- performer / talent releases where relevant
- music master and publishing rights where relevant
- artwork / still / archival / clip permissions where relevant
- territory and language scope
- media / platform scope
- linear, non-linear and ancillary classification
- term and expiry
- exclusivity
- existing licences, windows and holdbacks
- sublicensing authority
- syndication authority
- distribution authority
- dubbing / adaptation / remake authority
- censorship / certification / regulatory documents where required
- warranties, indemnities and insurance requirements where applicable
- contract approval and signature authority

A title cannot be marketed as having a right that is not supported by the governing agreement or verified mandate.

### 2. Creative and documentation track

The buyer-facing package may require:

- canonical title
- alternate / localized titles
- logline
- synopsis
- genre
- runtime
- year / release status
- language and version map
- director / producer / cast / crew credits
- approved poster / key art
- stills
- trailer / teaser
- screener
- EPK / press materials
- subtitles / captions
- dialogue list / continuity script where required
- music cue sheet where required
- credits sheet
- localization materials
- festival / award evidence where claimed
- buyer one-sheet / catalogue entry
- contact and rights summary

Creative claims must match source evidence. AI-generated copy is draft content until a human reviewer approves it.

### 3. Technical and delivery track

Technical readiness may include:

- source / master inventory
- master version identification
- file naming and version control
- container / codec
- resolution
- frame rate
- aspect ratio
- scan type
- bit depth / colour space where required
- audio language and channel layout
- loudness / peak compliance where required
- subtitles / captions format and sync
- artwork dimensions and file format
- metadata completeness
- checksums / integrity evidence
- technical QC report
- visual / audio defect log
- screener security / watermarking policy
- delivery storage location
- transfer / delivery method
- platform-specific delivery package
- delivery receipt
- buyer technical acceptance or rejection

Delivery completion is not declared from upload success alone. It requires buyer/platform acceptance evidence when the deal requires it.

### 4. Customer and human scrutiny track

Human review remains mandatory at defined gates.

- Creator / rights holder confirms ownership and authority.
- Legal reviewer verifies rights evidence and contract scope.
- Creative reviewer verifies buyer-facing representation and approved assets.
- Technical QC reviewer verifies delivery readiness.
- Buyer / customer reviews screening, offer and required acceptance items.
- Finance reviewer verifies invoicing, receipt and settlement evidence.
- Founder / authorised final approver confirms high-risk commercial commitments when required.

Every approval records the reviewer identity, role, timestamp, decision, reason and evidence reference.

### 5. Audit and evidence track

Every important action must produce a durable evidence record.

Evidence may include:

- source document reference
- source message / thread reference
- source repository commit
- database record ID
- document version
- checksum / hash where practical
- AI report version
- human reviewer identity
- decision timestamp
- approval / rejection reason
- previous state
- new state
- exception / override reason

No silent state promotion is allowed.

### 6. AI processing and reporting track

Approved AI tools may assist with:

- document classification
- contract / mandate field extraction
- rights-matrix extraction
- conflict and expiry detection
- missing-document detection
- metadata normalization
- duplicate detection
- catalogue packaging
- buyer requirement extraction
- title-to-buyer matching
- lead qualification
- offer / proposal drafting
- contract comparison
- delivery checklist generation
- QC issue summarization
- risk scoring
- next-action recommendations
- revenue pipeline summaries
- settlement reconciliation assistance
- audit report generation

AI outputs must preserve source references and confidence. Low-confidence or conflicting output is automatically routed to human review.

## Stage-by-stage control flow

### CREATE

**Goal:** capture the project, creator and source materials.

Required outputs:
- project identity
- creator / producer identity
- initial source documents
- initial title metadata
- provenance record

Human gate: creator / authorised representative confirms the submission.

### PRODUCE

**Goal:** maintain production-side evidence and asset lineage.

Required outputs may include:
- production company / producer
- key agreements
- music / talent / contributor records
- master and version inventory
- release / certification status

Human gate: production representative confirms authoritative project records.

### REPRESENT

**Goal:** establish exactly what StreamVista / Crayons Pictures is authorised to do.

Required outputs:
- signed mandate / agreement or other valid authority
- rights owner
- authorised rights scope
- territories
- languages
- term
- exclusivity
- right to negotiate
- right to license, if granted
- right to syndicate, if granted
- right to distribute, if granted
- right to appoint technical delivery providers, if granted

Human gate: legal review + authorised rights holder confirmation.

### VERIFY

**Goal:** prove the rights and evidence package before commercial circulation.

Required outputs:
- legal rights matrix
- chain-of-title status
- conflicts / encumbrances report
- expiry / window report
- missing-document report
- legal verification decision

Hard gate: no right may be offered if its verification status is not `verified`.

### PACKAGE

**Goal:** build a controlled buyer-ready package.

Required outputs:
- approved creative metadata
- approved marketing assets
- rights summary
- screener configuration
- technical specification summary
- commercial assumptions clearly marked as approved or pending

Human gate: creative + legal + technical review as applicable.

### MARKET

**Goal:** take only authorised opportunities to market.

Required outputs:
- approved target market
- approved positioning
- permitted claims
- permitted recipients
- outreach / campaign record

AI may draft and rank outreach. Human approval is required when commercial commitments or sensitive rights claims are included.

### MATCH

**Goal:** match the title to real buyer criteria.

Required outputs:
- buyer identity / organisation
- buyer verification status
- acquisition criteria
- title-to-criteria match report
- territory / rights compatibility result
- conflicts / exclusions
- match confidence

Human gate: commercial reviewer confirms high-value introductions or rights-sensitive matches.

### NEGOTIATE

**Goal:** control offers and counteroffers without exceeding authority.

Required outputs:
- offer history
- counteroffer history
- price / MG / revenue share / term
- rights scope under discussion
- territory / language / exclusivity
- approval status
- deviation / exception report

AI may compare terms and identify risks. It may not accept a binding commercial offer.

### LICENSE

**Goal:** convert approved terms into an executed licence.

Required outputs:
- final rights scope
- approved commercial terms
- contract version
- legal approval
- authorised signatures
- effective date
- obligations / milestones

Hard gate: no deal is `licensed` until execution evidence is recorded.

### SYNDICATE

**Goal:** permit additional authorised exploitation or package distribution where the underlying agreement allows it.

Required outputs:
- source authority for syndication
- downstream platform / partner
- title / package list
- territory / language / media scope
- restrictions
- reporting obligations
- revenue logic

Hard gate: syndication cannot exceed the upstream grant.

### DISTRIBUTE

**Goal:** route approved content to authorised platforms / territories.

Required outputs:
- destination
- distribution authority
- delivery package requirements
- scheduling / window data where applicable
- technical provider authority where applicable
- distribution tracking record

### DELIVER

**Goal:** deliver compliant assets and prove acceptance.

Required outputs:
- final asset manifest
- checksums
- QC report
- delivery timestamp
- recipient
- transfer evidence
- acceptance / rejection report
- correction history if rejected

Hard gate: upload alone is not delivery acceptance.

### MONETISE

**Goal:** convert licensed exploitation into traceable revenue.

Required outputs may include:
- invoice / payment schedule
- platform statements
- ad / subscription / licence revenue evidence
- deductions / taxes / fees
- receivable status
- reconciliation report

AI may reconcile and flag anomalies. Finance confirms the authoritative result.

### SETTLE

**Goal:** close the financial obligation accurately and audibly.

Required outputs:
- amount received
- contractual split
- approved deductions
- tax / withholding evidence where applicable
- creator / partner payable
- payment instruction approval
- payment evidence
- settlement statement
- final audit trail

Hard gate: money movement and settlement approval require authorised human control.

## Evidence-gated lifecycle

Recommended generic state machine:

`draft -> evidence_collecting -> ai_reviewed -> human_review_required -> verified -> approved_for_next_stage`

Failure states:

`blocked | rejected | expired | conflict | superseded`

No UI should display `verified`, `licensed`, `delivered`, `paid`, `settled` or `complete` unless the corresponding evidence gate has passed.

## Technical implementation principle

Build the workflow as composable capabilities rather than one giant transaction table.

Recommended entities:

- Party
- Organisation
- PartyCapability
- Title
- AssetVersion
- RightsGrant
- AuthorityMandate
- EvidenceItem
- DocumentVersion
- VerificationCheck
- HumanReview
- AIProcessingRun
- BuyerRequirement
- Match
- ScreeningRequest
- Offer
- Deal
- Contract
- SyndicationInstruction
- DistributionInstruction
- DeliveryPackage
- DeliveryAcceptance
- RevenueStatement
- Invoice
- Payment
- Settlement
- AuditEvent

Each entity keeps its own evidence and lifecycle state. The deal aggregates verified records; it does not replace them.

## Existing StreamVista alignment

The current StreamVista code already contains creator and buyer role concepts, rights fields, buyer screening, deal flow and protected workspaces. The canonical Supabase model also includes title-rights, marketplace-deal, screening, audit, delivery and payment structures. The next implementation should extend these primitives rather than create a second parallel marketplace.

Important architecture correction: business personas such as studio, distributor, syndicator and licensor should be modelled as scoped capabilities / relationships, while authentication roles remain focused on security and access control.

## Founder and brand positioning

- **Abijith Asokan** - filmmaker, founder and authorised final business approver where required.
- **Crayons Pictures** - filmmaking, creator / producer relationships, content representation and commercial industry interface.
- **StreamVista.in** - technology, rights intelligence, licensing, syndication, distribution, delivery, monetisation and settlement operating layer.

This combination supports filmmaker-to-buyer execution while preserving evidence, human scrutiny and legal authority at every consequential stage.
