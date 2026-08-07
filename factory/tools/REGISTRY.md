# Tool Registry

Canonical index contract for connectors, MCP servers, repository utilities, deployment utilities, infrastructure inspectors, and automation capabilities.

## Required fields
- id
- category
- capability
- provider
- owner
- implementation_status
- auth_mode
- permissions
- read_write_scope
- products_using
- evidence_path
- health
- last_verified

## Categories
- GitHub
- Vercel
- Cloudflare
- Supabase
- MCP
- repository
- deployment
- environment
- DNS
- SSL
- automation
- communication
- payment

## Safety rule
Tools must use least privilege. Destructive, billing, irreversible production, or permanent data-loss actions require explicit owner confirmation unless already covered by an exact approved reversible workflow.

## Reuse rule
Products consume tools through shared interfaces where possible. Product-specific copies are last resort.
