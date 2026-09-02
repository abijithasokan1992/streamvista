# StreamVista Revenue Engine

## Canonical Revenue Architecture

> Lead → Qualification → Offer → Follow-up → Deal → Payment → Delivery → Revenue → Repeat / Referral

## Revenue Plugin Map

| Function | Canonical Tool | Role | Status |
|---|---|---|---|
| Lead finding / enrichment | Clay | Prospect discovery and enrichment | Connected / Available |
| CRM / companies / contacts | HubSpot | Customer and company CRM | Connected / Available |
| CRM / deals | Attio | Deal and relationship management | Connected / Available |
| Sales CRM / calls / email / SMS | Close | Sales execution | Connected / Available |
| Customer / transactional email | Resend | Automated transactional messaging | Connected / Available |
| Customer payments | Razorpay | Payment collection and payment evidence | Connected / Available |
| Product / revenue analytics | PostHog | Product funnel and revenue analytics | Connected / Available |
| Product analytics | Amplitude | Product and conversion analytics | Connected / Available |
| Sales / project execution | ClickUp / Linear / Asana | Operational execution | Connected / Available |
| AI sales / research | OpenAI + Exa | Research, qualification and sales intelligence | Available |
| Website / apps | Vercel | Application hosting and delivery | Connected / Available |
| Customer / business database | Supabase | Application data, auth, RLS and storage | Connected / Available |
| Business mailbox | Hostinger Mail | Canonical business/customer communication | Connected / Available |
| Source / version / release | GitHub | Canonical source of truth | Connected / Available |

## Core Revenue Flow

Clay
→ Find & Enrich Prospects
→ HubSpot / Attio / Close
→ CRM + Sales Pipeline
→ Hostinger Mail / Resend
→ Offer / Proposal / Follow-up
→ Deal
→ Razorpay
→ Payment
→ Supabase
→ Order / Customer / Deal / Revenue Record
→ PostHog / Amplitude
→ Conversion + Revenue Analytics

## Crayons Bridge Revenue Flow

Creator
→ Rights Verification
→ Buyer
→ Deal Room
→ License
→ Invoice / Payment
→ Revenue
→ Delivery
→ Repeat / Referral

### System responsibilities

- GitHub: canonical source code, migrations, configuration, version history and release source.
- Supabase: canonical application and business data, authentication, RLS and storage metadata.
- Razorpay: payment execution and payment evidence.
- Hostinger Mail: canonical business/customer mailbox and communication.
- Clay: prospect discovery and enrichment.
- HubSpot / Attio / Close: sales and relationship workflows.
- Resend: optional transactional email support; it does not replace the canonical Hostinger business mailbox.
- PostHog / Amplitude: product, funnel and conversion analytics.
- Vercel: application hosting and delivery.

## Architecture Rule

The connected tools do not by themselves mean the business workflow is operational. Integration must be implemented as one verified lead-to-payment-to-revenue workflow.

## Source-of-Truth Rule

For the StreamVista Core 4:

**GitHub = SOURCE**
**Supabase = DATA**
**Razorpay = MONEY**
**Hostinger Mail = COMMUNICATION**

No competing system should become the source of truth without explicit architecture approval.
