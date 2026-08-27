# StreamVista Cloud X: Creator Studio Cloud Storage

## Concept
Cloud X is the secure, high-speed storage infrastructure for Crayons Bridge and Streamvista. It serves as the "Digital Vault" for rights-cleared film assets.

## Core Features
1. **Multi-Cloud Orchestration:** Transparently manage assets across OCI (Oracle) and GCP (Google Cloud).
2. **AI-Enhanced Storage:** Automated technical QC and metadata tagging upon upload (via Gemini).
3. **Rights-Aware Access:** Permissions are automatically derived from the "Rights & Licensing" module.
4. **Studio-Grade Delivery:** Direct integration with OTT delivery specs (DPP/EML).

## Technical Implementation
- **Backend:** `QCService.ts` handles the scanning of files landing in Cloud X.
- **Metadata:** All file pointers and checksums are stored in the Oracle DB `inventory` table.
- **Security:** JWT-based secure URLs for partner previews.
