# STREAMVISTA OS MASTER ENGINEERING CHARTER v1.0

This is the central governing document for the StreamVista OS project. All implementation agents (Antigravity), planning agents (ChatGPT), and human team members must adhere to these policies, priorities, and quality standards during development.

## Sections

1. **Vision**: StreamVista OS is an end-to-end Media Commerce Operating System connecting creators, buyers, and administrators securely on a single platform.
2. **Mission**: Deliver a complete, production-ready full-stack platform; prioritize revenue-generating features.
3. **Operating Constitution**: Every implementation should improve Revenue, Security, Reliability, Performance, UX, Scalability, or Maintainability.
4. **Product Principles**: Business first; answer "Does this help StreamVista generate revenue?"
5. **Default Action: CONTINUE**: Continue implementation automatically until a defined pause condition applies. Do not pause for routine decisions.
6. **Aggressive Mode**: Default action is CONTINUE. Choose the safest, document it, continue.
7. **Architecture Standards**: Maintain clean architecture; keep commits small and meaningful. Leave the repository in a buildable state.
8. **Revenue Engine**: Configurable commissions, storage fees, service fees via Admin interface.
9. **Money Pipeline**: Strict financial traceability: Buyer -> Agreement -> Payment -> Verification -> Invoice -> Ledger -> Wallet -> Settlement -> Reports -> Audit.
10. **Creator Workflow**: Registration -> Upload -> Metadata -> Dashboard.
11. **Buyer Workflow**: Discovery -> Review Assets -> Execute Agreement -> Payment -> Delivery.
12. **Admin Workflow**: Mission Control -> QC Verification -> Legal Verification -> Global Configuration.
13. **Finance & Settlement**: Transparent ledger; robust creator wallets; escrow tracking.
14. **Analytics & Reporting**: Track Creator/Buyer growth, GMV, platform commission, conversion rates.
15. **AI & MCP Governance**: AI assists but does not silently override high-impact business decisions (publishing, legal, financial, data deletion).
16. **Security Standards**: Never expose secrets/credentials. Verify webhook signatures. Follow principle of least privilege.
17. **Data Governance**: All business data must be versioned, auditable, recoverable, permission-controlled, traceable, and backed up.
18. **Performance Standards**: The platform should be fast, observable, maintainable, and scalable.
19. **Reliability & Disaster Recovery**: Support scheduled backups, point-in-time recovery, validate restores, and document recovery procedures.
20. **Release Standards**: Build succeeds, tests pass, security review completed, monitoring enabled.
21. **Observability**: Expose health status, error logs, performance metrics, audit events, financial reconciliation.
22. **Engineering Standards**: Finish complete workflows, not isolated features.
23. **Quality Gates**: Build succeeds. Type checks succeed. Tests pass. Security checks pass.
24. **Production Readiness**: All critical workflows complete, automated tests pass, audit active, no P0/P1 defects.
25. **Definition of Done**: Workflow functions end-to-end; business rules configurable; tests pass; ready for deployment.

## Priorities
- **P0**: Production outage, security vulnerability, data integrity, payment failures.
- **P1**: Revenue-critical workflows (creator onboarding, buyer journey, agreements, payments, delivery, settlements).
- **P2**: Platform reliability, analytics, reporting, notifications, monitoring.
- **P3**: Performance, scalability, maintainability, developer experience.
- **P4**: UI polish, cosmetic improvements, optional enhancements.

## Pause Conditions
Stop ONLY if continuing would:
- Risk production data loss or corruption.
- Expose secrets or credentials.
- Enable live payment processing or financial settlement without explicit authorization.
- Perform an irreversible production operation.
- Require a legal, contractual, or regulatory approval.
- Depend on an unavailable external service or account.
- Violate the platform's security, compliance, or governance standards.
