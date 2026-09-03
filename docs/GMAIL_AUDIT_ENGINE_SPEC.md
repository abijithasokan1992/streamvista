# StreamVista Gmail Audit Engine — Product & Security Specification

## Objective

Build a dedicated Gmail Audit Engine that lets an authenticated user connect their Gmail account and perform controlled read/write operations, search, scrutiny, classification, evidence extraction, risk analysis, and action tracking across the mailbox.

This engine is an audit and operations capability, not a password collector. It must use Google OAuth 2.0 and Gmail APIs with explicit scopes, never request or store Gmail passwords, OTPs, recovery codes, or banking credentials.

## Immediate business use case

Prioritize detection and evidence collection for financial and banking communications, especially:

- South Indian Bank
- Account references ending in 45901
- NPA / pre-NPA / overdue / default / recall / demand / legal escalation language
- OneCard
- Collection agencies or recovery communications
- Payment deadlines and promised dates

The engine must distinguish verified mailbox evidence from inference. It must never declare an account NPA solely from a generic warning email.

## Core capabilities

### 1. Read and search

- Search Gmail using Gmail search syntax and structured filters.
- Read message headers, sender, recipients, dates, labels, thread, body, and attachments metadata.
- Search inbox, sent, archive, spam, and trash subject to granted scopes.
- Search by sender/domain, account suffix, amount, date, keywords, message IDs, and thread IDs.
- Detect duplicate/near-duplicate notices.
- Build chronological timelines from related messages.

### 2. Scrutiny and intelligence

Classify messages into:

- FINANCIAL
- BANKING
- CREDIT_CARD
- LOAN
- PAYMENT
- COLLECTION
- NPA_WARNING
- NPA_CLASSIFIED
- LEGAL_ESCALATION
- SECURITY
- PHISHING_SUSPECTED
- BUSINESS_CRITICAL
- LOW_PRIORITY

For each finding store:

- exact source message ID
- received date/time
- sender
- subject
- relevant excerpt
- evidence terms
- confidence
- classification
- recommended next action

### 3. NPA-specific evidence engine

For South Indian Bank / account 45901 searches, detect phrases and facts such as:

- NPA / Non Performing Asset
- SMA / Special Mention Account
- overdue
- days past due / DPD
- 90 days / 91 days / three months
- recall
- demand notice
- legal notice
- classification
- default
- payment deadline
- regularisation
- settlement
- restructuring

Build a timeline:

`facility/account reference -> due date -> overdue start -> notices -> 30/60/90+ day references -> escalation -> latest status`

Return one of:

- VERIFIED_NPA_CLASSIFICATION
- VERIFIED_NPA_WARNING
- VERIFIED_OVERDUE_ONLY
- NO_NPA_EVIDENCE_FOUND
- INSUFFICIENT_EVIDENCE

Never infer a verified NPA classification when the evidence only says "avoid NPA" or "may become NPA".

### 4. OneCard analysis

Search for OneCard communications, including:

- statement/payment due notices
- overdue notices
- default warnings
- collection communications
- legal escalation
- settlement offers
- account closure/suspension notices

Cross-reference only when the message itself establishes a relationship to South Indian Bank or another facility. Do not assume liabilities are linked merely because the same person receives both emails.

### 5. Write/action capability

Support controlled write actions only after explicit user confirmation for each operation class:

- archive/unarchive
- mark read/unread
- star/unstar
- add/remove labels
- move messages
- draft replies
- create drafts from approved templates
- send approved replies
- trash/restore

Destructive or externally visible actions must require confirmation and show a preview of the exact operation.

The system must maintain an immutable audit record of every write action including actor, time, message/thread ID, operation, before/after state where available, and confirmation source.

### 6. Safety controls

- OAuth only; no password collection.
- Principle of least privilege for Gmail scopes.
- Separate read scopes from modify/send scopes where possible.
- Default mode: READ_ONLY.
- WRITE mode disabled until explicitly enabled by the user.
- SEND mode requires explicit confirmation immediately before sending.
- Never auto-send financial, legal, banking, or collection communications.
- Never delete messages automatically.
- Never expose full sensitive message bodies in logs.
- Encrypt stored tokens and sensitive derived data.
- Support OAuth revocation/disconnect.

### 7. Dashboard

Create a Gmail Audit Center with:

- Connected account status
- Last audit time
- Critical findings
- Banking/NPA findings
- Payment deadlines
- Unanswered important messages
- Security alerts
- Suspicious messages
- Recent actions
- Evidence timeline
- Search box with saved audit queries
- Read-only / Write-enabled status indicator

### 8. Evidence model

Every finding must have a traceable evidence chain:

`Finding -> Message ID -> Thread ID -> Date -> Sender -> Subject -> Evidence excerpt -> Rule/model -> Confidence`

The UI must clearly label:

- VERIFIED — directly supported by mailbox evidence
- INFERRED — analytical interpretation
- UNVERIFIED — insufficient evidence

### 9. Initial audit queries

Implement saved queries for:

1. `"45901"`
2. `"45901" NPA`
3. `"45901" overdue`
4. `"45901" "90 days"`
5. `"45901" "non performing"`
6. `"South Indian Bank" NPA`
7. `"South Indian Bank" overdue`
8. `"South Indian Bank" "90 days"`
9. `OneCard overdue`
10. `OneCard NPA`
11. `OneCard default`
12. `OneCard collection`
13. `OneCard legal notice`

The application must allow date-range variants and sender/domain variants.

### 10. Architecture expectations

Prefer a modular architecture:

- Gmail OAuth adapter
- Gmail API client
- Search service
- Message ingestion/normalization service
- Evidence extraction service
- Financial/NPA rules engine
- Classification service
- Timeline builder
- Findings store
- Audit log
- Action/approval service
- Dashboard UI

Reuse the existing StreamVista TypeScript/React architecture rather than creating a separate technology stack without need. The repository already includes React/Vite and the Google APIs dependency, so implementation should compose with the existing stack. Avoid duplicate legacy API trees.

### 11. Data minimization

Persist only the minimum required fields. Prefer message IDs, metadata, normalized findings, and short evidence excerpts over copying full mailbox contents. Attachment bodies should not be downloaded unless explicitly required for an audit task.

### 12. Testing and release gate

Before production enablement:

- OAuth login test
- Scope verification
- Gmail search test
- Message read test
- Thread reconstruction test
- NPA classification fixture tests
- False-positive tests for "avoid NPA" vs "classified NPA"
- Permission/consent tests
- Write-operation approval tests
- Send confirmation tests
- Audit-log integrity tests
- Secret/token storage tests
- Error and rate-limit handling
- Production environment contract verification

Production release requires:

`IMPLEMENT -> TYPECHECK -> BUILD -> TEST -> SECURITY REVIEW -> PR -> CI PASS -> REVIEW -> MERGE -> DEPLOY -> EXACT-SHA VERIFICATION`

No blind production promotion.

## Phase 1 deliverable

Implement the minimum production-ready read-only Gmail Audit Center focused on:

- Gmail OAuth connection
- Search/read
- South Indian Bank + account 45901 audit
- OneCard audit
- NPA/overdue evidence classification
- Timeline
- Critical findings dashboard
- Evidence traceability

Phase 2 adds controlled labels/archive/draft capabilities.

Phase 3 adds confirmed send workflows and broader mailbox automation.
