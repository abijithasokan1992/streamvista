#!/bin/bash

# Production Provisioning Script for UNION Auto Spares (streamvista-495500)
PROJECT_ID="streamvista-495500"
REGION="asia-south1"

echo "Provisioning production infrastructure for $PROJECT_ID..."

# 1. Setup Secrets (Assuming values are stored in your env or passed)
# This maps the secrets into Cloud Run at runtime
gcloud secrets create DB_PASSWORD --replication-policy="automatic"
echo -n "Abi@123456789" | gcloud secrets versions add DB_PASSWORD --data-file=-

gcloud secrets create RAZORPAY_KEY_SECRET --replication-policy="automatic"
echo -n "5pn6E0MqMjy1jjyCvT9TDyrx" | gcloud secrets versions add RAZORPAY_KEY_SECRET --data-file=-

gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "AIzaSyDEkEvNu28F2Zg3xllLuxKn0Av84hAWLSg" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

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
