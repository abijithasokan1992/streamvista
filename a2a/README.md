# StreamVista A2A Revenue Agent Layer

## Purpose

Turn the existing StreamVista Creator / Marketplace / Sales / Payment surfaces into an agent-to-agent revenue workflow.

## Agents

- Revenue Orchestrator — routes commercial work and maintains evidence gates.
- Creator Acquisition Agent — qualifies inbound creators and prepares the ₹25,000 OTT Readiness offer.
- Rights & Catalog Agent — validates title metadata, rights readiness and missing evidence.
- Buyer Match Agent — identifies buyer-fit opportunities from verified catalog data.
- Deal Desk Agent — prepares deal-room actions and commercial negotiation state.
- Payment Agent — prepares Razorpay order/verification actions; never bypasses server-side verification.
- Follow-up Agent — creates follow-up actions for qualified leads and stalled opportunities.

## Hard rules

1. No agent claims a transaction is complete without system evidence.
2. No agent writes secrets into GitHub or client code.
3. No direct creator-to-buyer contact is initiated by an agent unless an authorized workflow explicitly permits it.
4. Payment state is sourced from the application ledger / Razorpay verification path.
5. Agent actions that change financial, rights, or access state require explicit server-side authorization.
6. Existing StreamVista components are reused before new features are created.

## Revenue-first workflows

### Creator readiness

Inbound lead → qualification → rights-readiness check → ₹25,000 package offer → payment → onboarding task → marketplace publication candidate.

### Buyer licensing

Verified buyer → catalog discovery → title screening request → deal room → payment_pending → Razorpay checkout → payment verification → fulfilled/paid state.

### Sales recovery

Lead with no response → follow-up queue → evidence-backed reminder → escalation to founder/admin when required.

## A2A envelope

```json
{
  "message_id": "string",
  "from_agent": "string",
  "to_agent": "string",
  "task": "string",
  "entity_type": "lead|creator|title|buyer|deal|payment",
  "entity_id": "string",
  "status": "proposed|accepted|blocked|completed",
  "evidence": [],
  "requires_approval": false,
  "created_at": "ISO-8601"
}
```

## Production boundary

The repository contains the product implementation and A2A contract. Platform credentials remain in deployment environment configuration. The A2A layer must fail closed when required production credentials or canonical data dependencies are unavailable.
