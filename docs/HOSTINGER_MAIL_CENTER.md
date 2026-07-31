# Hostinger Mail Center

## Verified identities

- `abijithasokan@crayonspictures.com` — Abijith Asokan — Founder / final approval
- `support-bridge@crayonspictures.com` — Sarin — Support / Crayons Bridge
- `finance-bridge@crayonspictures.com` — Aruna Sankar CA — Finance / accounts / compliance

## Hostinger folders

The following folders are the canonical Mail Center lanes:

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
11. `99 Newsletters`

## Code

- `src/config/mailCenter.ts` contains identities, folder names, routing rules and ownership.
- `src/services/mailClassifier.ts` contains a deterministic classifier that can be used by a webhook, scheduled sync job, Edge Function or admin Mail Center.

## Required server-side integration

Do not expose Hostinger credentials in the Vite client. The production connector must run in a trusted backend, Supabase Edge Function, or server API.

Recommended environment variables:

```env
HOSTINGER_EMAIL_API_BASE_URL=
HOSTINGER_EMAIL_API_TOKEN=
HOSTINGER_MAILBOX_RESOURCE_ID=
MAIL_SYNC_SECRET=
```

Recommended processing flow:

1. Receive Hostinger webhook or run scheduled inbox sync.
2. Normalize message metadata.
3. Call `classifyMail`.
4. Persist classification and audit data.
5. Move the message to the mapped Hostinger folder.
6. Notify Abijith for urgent/founder items.
7. Assign Finance items to Aruna Sankar CA and Support items to Sarin.

## Safety rules

- Never auto-send replies without human approval.
- Never auto-approve rights, contracts, payments, refunds or legal decisions.
- Keep Crayons Pictures and StreamVista financial records separate.
- Log every automated move, classification and assignment.
