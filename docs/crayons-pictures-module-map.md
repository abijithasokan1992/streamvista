# Crayons Pictures — Production Module Map

| Product surface | API / data boundary | Real execution required | Release state |
|---|---|---|---|
| Studio Home | workspace + project queries | no | foundation |
| AI Chat | `ai_runs`, conversations, provider gateway | yes | provider wiring required |
| Script Optimizer | AI run + versioned document | yes | provider wiring required |
| Logline / Synopsis | AI run + document artifact | yes | provider wiring required |
| Viral Shorts Script | AI run + template | yes | provider wiring required |
| Buyer Matchmaker | rights metadata + buyer catalogue + ranking service | yes | existing Bridge data to reuse |
| Asset Vault | object storage + asset metadata | yes | storage contract required |
| Dubbing / Voice | render job + voice provider adapter | yes | provider credentials + worker |
| 2D → 3D Spatial | render job + spatial provider adapter | yes | provider credentials + worker |
| Cartoon / Anime | render job + stylization provider adapter | yes | provider credentials + worker |
| Subtitle / Translate | AI run + artifact | yes | provider wiring required |
| Storyboard / Shot Planner | AI run + project entities | yes | provider wiring required |
| QC / Compliance | deterministic checks + media worker | yes | worker required |
| Rights / Chain of Title | rights tables + audit + approvals | no | reuse StreamVista/Bridge domain |
| Marketplace / Deal Room | Bridge tables + RLS + approvals | no | reuse existing production schema |
| Billing | Razorpay order/payment/webhook state | yes | hardening required |
| Email | Hostinger transactional mail | yes | mailbox exists; SMTP/API contract required |
| Product analytics | canonical event taxonomy | yes | PostHog active; event plan required |
| Analytics secondary sink | Amplitude | yes | connected project; enable intentionally |
| Admin control plane | health + queue + usage + provider health | yes | build against real data |
| Mobile app | Expo client over same API | yes | client shell required |

## Reuse rule

Do not rebuild existing StreamVista/Crayons Bridge rights, marketplace, billing, audit and profile primitives when they already satisfy the product contract. Compose them behind a stable Crayons Pictures API instead.

## Data ownership rule

UI components never invent job status, payment status, asset state, entitlement state or provider success. These states come from persisted backend records.
