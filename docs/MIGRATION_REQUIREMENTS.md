# Migration Requirements

## Data Target
- Source: Old StreamVista JSON database exports.
- Destination: New Firebase Cloud Firestore.

## Entities to Migrate
- **98 User Profiles** (Do NOT migrate old passwords, sessions, or expired tokens).
- **21 Films**
- **139 Film Drafts** (Cleanse duplicate/empty drafts during migration).
- **34 Buyer-to-film mappings** (Assign to Buyer Dashboard).
- **16 Payments** (Do NOT expose Razorpay signatures or private keys).
- **8 Upload-status records**
- **15 View-history records**
- **64 Permission records**

## Process Strategy
1. **Quarantine & Parse**: All source data must be passed through a mapping script which produces a CSV or JSON map mapping old legacy ID to new Firestore UUID.
2. **Review & Approve**: The generated mapping artifacts (e.g. `migration/mappings/users-id-map.json`) must be manually reviewed for quarantine, duplicates, or skips.
3. **Dry Run**: Validate relationships (e.g. no orphans) via a validation script before committing to Firebase.
4. **Execution**: Upload records sequentially while respecting Firebase Security Rules data validation constraints.

## Constraints
- Never auto-contact users during the migration process.
- All secrets from Razorpay and old auth hashes must be stripped.
