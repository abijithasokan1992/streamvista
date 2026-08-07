# Product Registry

Canonical product index for FACTORY. Each product owns runtime code in its own repository/project; this registry only links and governs it.

## Required product record
- product_id
- name
- business_owner
- repository
- canonical_branch
- deployment
- domain
- database
- storage
- auth
- payment
- revenue_model
- implementation_status
- golden_baseline_status
- evidence_path
- current_blockers
- next_revenue_action

## Known products
- SV-Cloud-X
- SV-Creator-Cloud
- SV-AI-Chat
- SV-Buyer-Portal
- CB-Crayons-Bridge
- FAST-Crayons-Loop
- UAS-Union-Auto-Spares

## Rule
Do not move application runtime code into this support layer. This registry links to canonical runtime repositories and prevents duplicate product implementations.
