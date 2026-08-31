# Crayons Pictures — Production Build Contract

## Canonical runtime

- Web control plane: `streamvista.in`
- Source of truth: GitHub `abijithasokan1992/streamvista`
- System of record: Supabase production project `uakpqqardziifcwzvgfx`
- AI execution: server-side provider gateway; no client-side provider secrets
- Media execution: asynchronous worker/job layer; no fake progress states
- Commerce: Razorpay order -> checkout -> webhook -> `sv_payment_webhook_events` -> `sv_payments`
- Mail: Hostinger `message.received` -> Command API -> durable inbound event
- Analytics: Amplitude + PostHog production event taxonomy
- QA: Chrome DevTools MCP for controlled browser E2E/performance verification
- Native client: Expo consumes the same authenticated production API and Supabase contracts

## Product modules

1. Studio workspace
2. Projects and assets
3. Script/story AI
4. Logline and synopsis
5. Script optimizer
6. Shorts script
7. Scene/shot planning
8. Storyboard workflow
9. Translation/subtitles
10. Dubbing/voice workflow
11. Image generation/editing adapters
12. Video generation adapters
13. Media ingest/upload
14. Proxy/transcode/QC
15. 3D/spatial conversion jobs
16. Cartoon/anime conversion jobs
17. OTT packaging/export
18. Rights and chain-of-title
19. Crayons Bridge marketplace
20. Buyer portal
21. Deal room
22. Delivery/entitlements
23. Billing and Razorpay
24. Notifications/mail
25. Admin/operator control
26. AI/media job orchestration
27. Usage/cost accounting
28. Audit/security
29. Analytics/experimentation
30. Production QA/certification

## Non-negotiable rules

- No demo or mock production paths.
- No startup seeding of user-facing production catalog data.
- No legacy Oracle production dependency.
- No hard-coded founder identity or payment identity in application flows.
- No client-side secrets for AI, Razorpay, Supabase service role, SMTP, or other privileged providers.
- Long-running AI/media processing must be durable and observable.
- Every privileged operation must have an authorization boundary and audit event.
- `main` is promoted only after build, auth, database, storage, AI, mail, payment, analytics, browser E2E, and security gates pass.
