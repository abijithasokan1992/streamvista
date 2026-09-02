#!/bin/bash

# Production Provisioning Script for UNION Auto Spares (streamvista-495500)
PROJECT_ID="streamvista-495500"
REGION="asia-south1"

echo "Provisioning production infrastructure for $PROJECT_ID..."

# 1. Setup Secrets
# Export these values in the shell before running this script. Never commit live secret values.
: "${DB_PASSWORD:?Set DB_PASSWORD in the shell before running this script}"
: "${RAZORPAY_KEY_SECRET:?Set RAZORPAY_KEY_SECRET in the shell before running this script}"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY in the shell before running this script}"

gcloud secrets create DB_PASSWORD --replication-policy="automatic" || true
printf '%s' "$DB_PASSWORD" | gcloud secrets versions add DB_PASSWORD --data-file=-

gcloud secrets create RAZORPAY_KEY_SECRET --replication-policy="automatic" || true
printf '%s' "$RAZORPAY_KEY_SECRET" | gcloud secrets versions add RAZORPAY_KEY_SECRET --data-file=-

gcloud secrets create GEMINI_API_KEY --replication-policy="automatic" || true
printf '%s' "$GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Setup Cloud Armor
gcloud compute security-policies create union-armor-policy --description="DDoS and SQLi protection"
gcloud compute security-policies rules create 1000 --security-policy=union-armor-policy --expression="evaluatePreconfiguredExpr('cve-canary')" --action=deny-403

# 3. Setup Global Load Balancer (GCLB) with Serverless NEGs
# NEG for Backend
gcloud compute network-endpoint-groups create union-neg \
    --region=$REGION \
    --network-endpoint-type=serverless \
    --cloud-run-service=union-api

# Backend Service
gcloud compute backend-services create union-backend --global
gcloud compute backend-services add-backend union-backend \
    --global \
    --network-endpoint-group=union-neg \
    --network-endpoint-group-region=$REGION

# Map to Security Policy
gcloud compute backend-services update union-backend \
    --global \
    --security-policy=union-armor-policy

echo "Production infrastructure provisioned successfully."
echo "Final Step: Trigger deployment with: gcloud builds submit --config cloudbuild.yaml ."
