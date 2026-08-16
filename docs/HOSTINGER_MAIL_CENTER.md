# Hostinger Mail Center

## Verified mailbox access — 2026-08-15

The connected Hostinger Email API can directly manage:

- `abijithasokan@crayonspictures.com` — Abijith Asokan — Founder / final approval

Existing routing identities such as `support-bridge@crayonspictures.com` and `finance-bridge@crayonspictures.com` may be used by StreamVista configuration, but the current API discovery does **not** prove they are separately manageable mailboxes. Do not treat an alias or configured identity as an independently connected mailbox without API evidence.

## Canonical Hostinger folders

The current mailbox exposes these StreamVista/company operating lanes:

1. `01 Revenue Leads`
2. `02 Content Buyers`
3. `03 Content Owners`
4. `04 Licensing`
5. `05 Camera Rentals`
6. `06 Crayons Loop`
7. `07 Finance - Aruna`
8. `08 Support - Sarin`
9. `09 Legal & Compliance`
10. `10 Platform Alerts`
11. `11 StreamVista`
12. `12 Union Auto Spares`
13. `13 Company Admin`
14. `98 Automation Log`
15. `99 Newsletters`

The mailbox also contains standard system folders such as Inbox, Drafts, Junk, Sent, and Trash, plus older legacy folders. Preserve legacy folders until their contents and routing dependencies are audited; do not delete them merely because a newer numbered lane exists.

## StreamVista architecture

Hostinger Mail is a **communication execution connector inside StreamVista / Founder Command Center**, not a separate StreamVista product or app.

Recommended flow:

1. Read message metadata through the trusted Hostinger connector.
2. Classify by verified business rules.
3. Route to the appropriate canonical folder.
4. Record classification/assignment evidence in the StreamVista audit or communication layer when that integration is enabled.
5. Escalate only meaningful Founder actions.
6. Keep replies, rights decisions, contracts, payments, refunds, and legal commitments behind the appropriate human approval gate.

## Code

- `src/config/mailCenter.ts` contains mail identities, folder names, routing rules, and ownership where implemented.
- `src/services/mailClassifier.ts` contains deterministic classification logic where implemented.

Repository configuration must be checked against the live Hostinger folder inventory before claiming routing is connected end-to-end.

## Required server-side integration

Do not expose Hostinger credentials in the Vite client. The production connector must run in a trusted backend, Supabase Edge Function, server API, or approved MCP/connector runtime.

Example secret names may include:

```env
HOSTINGER_EMAIL_API_BASE_URL=
HOSTINGER_EMAIL_API_TOKEN=
HOSTINGER_MAILBOX_RESOURCE_ID=
MAIL_SYNC_SECRET=
```

Never commit values for these variables.

## Safety rules

- Never auto-send external replies unless the workflow explicitly permits that message type and required approvals are satisfied.
- Never auto-approve rights, contracts, pricing commitments, payments, refunds, or legal decisions.
- Keep company/accounting contexts separated when required.
- Log automated move/classification/assignment operations when automation is enabled.
- Do not delete messages or folders as a cleanup shortcut.
- Do not regenerate webhook secrets or rotate credentials without explicit approval.

## Current verification status

- Mailbox discovery: **verified**
- Folder inventory: **verified**
- Automatic classification-to-folder movement: **not verified in this pass**
- Automatic external sending: **not enabled or verified in this pass**
- Webhook execution: **not verified in this pass**
