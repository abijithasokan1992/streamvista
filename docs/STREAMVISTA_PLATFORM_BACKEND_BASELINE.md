# StreamVista Basic Platform Backend Baseline

## Purpose

This document defines the clean integration boundary for the StreamVista platform. It is a contract only; it does not contain credentials and does not authorize production changes by itself.

## Source of truth

- GitHub repository: `abijithasokan1992/streamvista`
- Production branch: `main`
- Vercel canonical project: `streamvista`
- Production domain: `https://streamvista.in`

## Service boundaries

### GitHub
Canonical source repository, commit history, pull requests, and deployment source.

### Vercel
Production web/API deployment for the canonical StreamVista application and custom domain.

### Supabase
Authentication, PostgreSQL data, Storage, and server-side Edge Functions. The authoritative production project must be verified before environment or database changes are made.

### Razorpay
Server-side order creation, payment verification, webhook processing, billing state, and reconciliation. Secrets remain server-side.

### Hostinger Mail
Transactional/inbound mail infrastructure. Mailbox and webhook configuration remain separate from frontend secrets.

## Secret boundary

Never place any of the following in browser-accessible `VITE_*` variables or GitHub source:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `HOSTINGER_WEBHOOK_SECRET`

## Release chain

Customer → StreamVista/Vercel → Supabase Auth/DB/Storage → Razorpay Billing → Hostinger Mail

Each integration must be independently verified before final production certification.
