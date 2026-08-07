# Agent Registry

This registry is the canonical support-layer index for reusable AI agents. It does not imply that every listed agent has executable code yet.

## Required fields for each agent
- id
- domain
- purpose
- owner
- implementation_status
- runtime
- permissions
- inputs
- outputs
- evidence_path
- version
- health
- certification_status

## Domains
- command
- platform
- devops
- business
- licensing
- content
- marketplace
- communication
- finance
- analytics
- film-industry
- design
- orchestration
- union-auto-spares

## Promotion gates
`planned -> draft -> prototype -> built -> live`

Promotion to `live` requires runtime evidence, least-privilege permissions, failure/rollback behavior, and Golden Baseline verification when production is affected.

## Reuse rule
Before creating a new agent: search this registry -> reuse -> extend -> compose -> create new only if no existing capability fits.
