# FACTORY Workforce

The Workforce layer coordinates reusable agents and tools. It must not duplicate product business logic.

## Core orchestrations
- Revenue workflow: opportunity -> qualify -> offer -> close -> payment -> support -> evidence
- Build workflow: search -> reuse -> compose -> branch -> build -> verify -> PR -> release
- Incident workflow: detect -> diagnose -> safest reversible fix -> verify -> evidence
- Growth workflow: acquire -> activate -> retain -> expand -> measure
- Support workflow: intake -> classify -> resolve -> verify -> knowledge update

## Runtime states
- idle
- running
- waiting_owner
- waiting_external
- blocked
- failed
- success

## Evidence
Every state transition that changes production, customer access, revenue flow, security, or data must emit evidence into `factory/audit/`.

## Golden Baseline
Production-impacting workflows must start from a verified baseline and must not promote a change that regresses required health gates.
