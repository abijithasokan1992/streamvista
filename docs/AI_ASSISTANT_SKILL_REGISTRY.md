# AI ASSISTANT — SKILL REGISTRY

This registry defines the initial skill system for **Ai Assitand**, the all-round Office Assistant.

## Skill categories

### Research & Intelligence
- `deep_research` — investigate a question across multiple sources.
- `answer_finder` — produce a direct, evidence-backed answer.
- `fact_check` — verify claims and flag contradictions.
- `source_critic` — rank source reliability.
- `current_info` — verify time-sensitive facts.
- `market_research` — research companies, products, markets, competitors.
- `technical_research` — research engineering and product questions.
- `legal_policy_research` — research public laws, rules, policies with citations; not legal advice.

### Memory
- `remember` — save explicitly useful approved information.
- `recall` — retrieve relevant prior information.
- `correct_memory` — update wrong memory.
- `forget` — remove user-requested memory.
- `decision_memory` — record decisions and rationale.
- `knowledge_capture` — convert useful research into durable knowledge.

### Communication
- `email_read`
- `email_draft`
- `email_triage`
- `message_draft`
- `translation`
- `meeting_notes`
- `meeting_brief`
- `executive_briefing`

### Work Management
- `task_create`
- `task_prioritize`
- `task_followup`
- `deadline_watch`
- `project_status`
- `daily_plan`
- `weekly_review`

### Software & Product
- `repo_research`
- `code_review`
- `architecture_review`
- `bug_analysis`
- `test_planning`
- `release_gate`
- `deployment_diagnosis`
- `integration_check`
- `security_review`

### Business
- `crm_research`
- `lead_research`
- `sales_brief`
- `customer_research`
- `partner_research`
- `invoice_summary`
- `payment_status`
- `business_analysis`

### Content / Film
- `film_research`
- `rights_research`
- `content_metadata`
- `screening_brief`
- `production_planning`
- `creative_research`

### Voice & Language
- `voice_listen`
- `voice_speak`
- `language_detect`
- `multilingual_conversation`
- `malayalam_first_response`

## Skill contract
Every skill must declare:

```yaml
name: skill_name
purpose: what the skill does
inputs: required information
outputs: expected result
tools: connected tools/APIs it may use
permissions: read | prepare | execute | privileged
verification: how success is verified
failure_mode: how blockers/errors are handled
memory_policy: what may be remembered
```

## Answer quality contract
For research/fact skills:

`Question → Search → Source ranking → Cross-check → Synthesis → Confidence → Citation`

The assistant must not manufacture a source, citation, fact, or completed action.

## Memory quality contract
Memory must be:
- intentional;
- searchable;
- source-aware where practical;
- editable;
- deletable;
- scoped by permission;
- protected from raw secret storage.

## Tool execution contract
For consequential operations:

`Intent → Permission → Plan → Execute → Verify → Evidence → Audit`

Financial transfers, destructive deletion, credential changes, legal commitments, or externally binding communications require an appropriate approval gate.

## Device skill contract
Phone, PC, and laptop operations require a dedicated device bridge. Web/Coda/GitHub access alone must never be represented as unrestricted device control.

Device skills may eventually include:
- app launch;
- approved file operations;
- browser workflows;
- notification reading;
- text entry;
- screenshot/context capture;
- approved workflow execution.

All device actions must respect OS permissions, app permissions, privacy boundaries, and user-defined authorization policies.

## Founder mode
Default interaction style:
- understand the request quickly;
- do the useful work rather than narrating every step;
- show concise results first;
- surface blockers immediately;
- preserve evidence;
- remember durable preferences only when appropriate;
- never claim access that is not actually available.
