#!/usr/bin/env bash
set -euo pipefail

# StreamVista production IAM bootstrap directives.
# Credentials are intentionally not stored in the repository.
# Execute with an authenticated gcloud session and environment-specific values.

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_LOCATION:?Set GCP_LOCATION}"
: "${VERTEX_SERVICE_ACCOUNT:?Set VERTEX_SERVICE_ACCOUNT}"

gcloud config set project "${GCP_PROJECT_ID}"

gcloud projects get-iam-policy "${GCP_PROJECT_ID}" >/dev/null

gcloud iam service-accounts describe "${VERTEX_SERVICE_ACCOUNT}" \
  --project "${GCP_PROJECT_ID}" >/dev/null

echo "StreamVista IAM prerequisites verified for ${GCP_PROJECT_ID}/${GCP_LOCATION}"
