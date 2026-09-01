# StreamVista Money Mode Playbook

## Commercial rule
Sell first. Collect legitimately. Deliver. Convert customers into catalog supply. Convert catalog into licensing deals.

## Canonical revenue funnel
`streamvista.in` → conversion surface → lead capture → qualification → Film Rights & OTT Readiness / paid onboarding → Razorpay checkout → payment verification → fulfillment → Crayons Bridge catalog supply → buyer matching → Deal Room → licensing → commission / recurring revenue.

## Primary cash offer
**Film Rights & OTT Readiness Package — ₹25,000**

Scope:
- Rights / ownership readiness review
- OTT metadata readiness
- Subtitle / QC readiness checklist
- Poster, trailer and asset readiness
- Buyer-ready content package
- Marketplace onboarding readiness

## Transaction model
- Fixed-fee readiness services for immediate cash flow
- Licensing commissions for catalog transactions
- Recurring StreamVista OS subscriptions / usage
- High-value Crayons Pictures AI Studio production/conversion services

## Product requirements
Every commercial CTA must have a measurable business outcome:
- lead
- qualification
- checkout start
- payment success
- fulfillment
- repeat / upsell

## Payment integrity
Razorpay remains the payment processor. Never fabricate payment success, bypass server-side verification, or mark business state paid without authoritative payment evidence.

Required production path:
`order → checkout → Razorpay payment → server verification → webhook → ledger/business-state persistence → fulfillment`

## Security
- No API secrets in GitHub
- No service-role key in browser code
- Keep Auth/RLS/RBAC enforced
- Do not use demo or synthetic revenue as production evidence

## Operating priority
1. Protect the currently working production runtime.
2. Repair/verify identity and payment boundaries with evidence.
3. Ship the smallest conversion surfaces using existing components.
4. Capture real leads and legitimate payments.
5. Fulfill paid packages.
6. Turn fulfilled customers into verified rights/catalog supply.
7. Match supply to buyers and progress licensing deals.
