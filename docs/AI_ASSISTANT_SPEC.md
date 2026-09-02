# AI ASSISTANT — All-Round Office Assistant

## Product identity
**Name:** Ai Assitand
**Role:** Founder/MD's all-round office assistant
**Repository:** `abijithasokan1992/streamvista`

## Mission
Build a trustworthy AI office assistant that can understand requests, research answers, remember approved context, plan work, and execute authorized actions across the user's work ecosystem.

## Core capabilities

### 1. Research & Answer Engine
- Deep web and document research.
- Multi-source synthesis.
- Distinguish facts, assumptions, opinions, and unknowns.
- Prefer primary/official sources for factual claims.
- Cite evidence for important answers.
- Compare conflicting sources and explain uncertainty.
- Produce concise answers first, with deeper analysis available.

### 2. Reasoning & Decision Support
- Break complex requests into tasks.
- Identify missing information.
- Generate options and trade-offs.
- Check calculations and consistency.
- Challenge incorrect assumptions instead of blindly agreeing.
- Maintain an explicit confidence/evidence state.

### 3. Long-Term Memory
Memory must be deliberate, searchable, and permission-aware.

Memory classes:
- Founder preferences
- People and organizations
- Projects and products
- Decisions and rationale
- Tasks and commitments
- Important dates/deadlines
- Communication style
- Reusable knowledge
- Credentials/secrets: **never store raw secrets in ordinary assistant memory**

Memory rules:
- Save only useful, authorized information.
- Attach source/evidence where practical.
- Track created/updated time.
- Allow correction and deletion.
- Never silently invent memories.

### 4. Voice Assistant
- Speech-to-text input.
- Text-to-speech output.
- Hands-free conversational mode.
- Interruption/barge-in support.
- Natural multilingual voice interaction.
- Language can change dynamically during a conversation.

Voice is an interface; authorization and execution controls remain separate.

### 5. Multilingual Intelligence
Initial language priorities:
- English
- Malayalam
- Hindi
- Tamil
- Telugu
- Kannada
- Bengali
- Marathi
- Gujarati
- Punjabi
- Urdu

Architecture must support adding more languages without rebuilding the core assistant.

### 6. Office Executive Skills
- Read and summarize emails, documents, messages, and project information.
- Draft professional replies, reports, proposals, notes, and briefs.
- Track action items and follow-ups.
- Prepare meetings and agendas.
- Maintain task queues and priorities.
- Research customers, partners, competitors, products, technology, regulations, and markets.
- Prepare daily/weekly executive briefings.

### 7. Technology & Development Assistant
- Read repositories and architecture.
- Search existing code before proposing new code.
- Reuse existing modules/components.
- Review pull requests and implementation plans.
- Diagnose build/deployment issues.
- Produce test plans and release gates.
- Never expose or commit secrets.
- Never make destructive production changes without the required authorization gate.

### 8. Action / Tool Orchestration
The assistant should eventually operate through connected tools and device bridges for:
- Coda
- GitHub
- Vercel
- Supabase
- Razorpay
- Email
- Calendar
- Cloud storage
- Slack/communications
- Browser automation
- Approved desktop actions
- Approved mobile actions

Every action must have:
`intent → permission check → execute → verify → evidence → audit log`

### 9. Phone / PC / Laptop Agent
Device control is a separate privileged layer.

Target abilities:
- Read approved notifications and app data.
- Open approved applications.
- Search files.
- Create/edit approved documents.
- Fill forms.
- Copy/paste between approved apps.
- Execute approved browser workflows.
- Control media and basic device functions where supported.

Safety boundaries:
- Explicit permissions per device/app/capability.
- Confirmation for sensitive, destructive, financial, legal, or externally-committing actions unless a specific standing rule authorizes them.
- No hidden monitoring.
- No credential harvesting.
- No bypass of OS/application security controls.

### 10. Verification Engine
Before presenting an answer as fact:
- Check source quality.
- Check freshness when time-sensitive.
- Cross-check important claims.
- Mark uncertainty.
- Prefer evidence over confidence.

Before claiming an action completed:
- Verify the resulting state.
- Record evidence.
- Report blockers honestly.

## Memory architecture
Suggested layers:
1. Working memory — current conversation/task.
2. Episodic memory — prior interactions and completed work.
3. Semantic memory — durable knowledge and preferences.
4. Operational memory — tasks, decisions, workflows, and system state.
5. Evidence store — source references and verification records.

## Skill registry
Each skill should define:
- name
- purpose
- trigger patterns
- required tools
- required permissions
- inputs/outputs
- verification method
- failure handling
- safety level

Suggested starter skills:
- Researcher
- Fact Checker
- Web Analyst
- Document Analyst
- Executive Briefing
- Email Assistant
- Meeting Assistant
- Task Manager
- Project Coordinator
- Developer Assistant
- Code Reviewer
- Release Engineer
- Finance Operations Assistant
- Sales Researcher
- CRM Assistant
- Content/Film Researcher
- Translator
- Writer/Editor
- Scheduler
- Personal Knowledge Manager
- Device Operator

## Operating principles
1. Understand before acting.
2. Research before answering uncertain questions.
3. Reuse before rebuilding.
4. Verify before claiming success.
5. Ask only when required information cannot be inferred safely.
6. Protect secrets and private information.
7. Maintain an audit trail for consequential actions.
8. Keep the Founder in control of permissions.

## Coda role
Coda is the assistant's human-readable operations and memory control center.

Recommended Coda areas:
- Assistant HQ
- Command Queue
- Memory
- People
- Projects
- Decisions
- Knowledge
- Tasks
- Permissions
- Action Log
- Research Library

## MVP definition
MVP should first deliver:
- text chat
- research + cited answers
- structured long-term memory
- multilingual text support
- voice input/output
- task management
- Coda integration
- GitHub integration
- permissioned action queue
- action verification + audit log

Device-wide phone/PC control should be added as a privileged integration layer rather than pretending web-only access can control every device.

## Definition of done
The assistant is considered operational only when it can:
- answer research questions with evidence;
- remember approved information across sessions;
- speak/listen in supported languages;
- create and track tasks;
- interact with connected work systems through permissioned tools;
- verify consequential actions;
- preserve an auditable history;
- fail safely when access or evidence is insufficient.
