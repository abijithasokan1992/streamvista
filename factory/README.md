# StreamVista FACTORY Support Layer

This directory is the shared support layer for StreamVista software, tools, MCPs, agents and operational workflows. It is intentionally isolated from product runtime code so that FACTORY organization can evolve without destabilizing production applications.

## Governing rules
1. Factory hierarchy
2. Golden Baseline before production promotion
3. Never rebuild. Always compose: Search -> Reuse -> Wire -> Verify -> Ship
4. Revenue first
5. Evidence only for completion claims

## Layers
- `platform/` shared capabilities
- `products/` product manifests and links
- `agents/` reusable agent specifications
- `tools/` connectors, MCPs and utilities
- `workforce/` orchestration and state
- `knowledge/` decisions and reusable project intelligence
- `operations/` execution queues and release controls
- `revenue/` money-facing opportunities, sales and payment workflows

## Status model
Every component must use exactly one implementation status:
- `live` - deployed and verified
- `prototype` - runnable partial implementation
- `draft` - specification/design exists, not verified runnable code
- `planned` - intended, not yet implemented

A component must not be promoted to `live` without evidence including repository/ref, verification result and timestamp.
