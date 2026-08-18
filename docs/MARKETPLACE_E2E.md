# Marketplace → Preview → Deal Room E2E

Canonical journey:

`Marketplace → Approved Title → Preview → Deal Room → Deal Record`

## Routes

- `/marketplace` — approved marketplace titles
- `/marketplace/:titleId/preview` — controlled title preview
- `/deal-room/:titleId` — buyer deal workspace

## Data wiring

- `sv_app_titles` — approved marketplace titles
- `sv_marketplace_deals` — commercial deal records
- Supabase RLS remains the data access authority.

## QA gate

1. Login as Buyer.
2. Open `/marketplace`.
3. Select an approved title.
4. Confirm `/marketplace/:titleId/preview` loads only an approved title.
5. Open Deal Room.
6. Start Deal.
7. Confirm a `sv_marketplace_deals` record is created for the authenticated buyer.
8. Confirm contract/payment status are visible.
9. Repeat with an unauthorized role and confirm access is denied.
10. Deploy the branch to Vercel Preview and run the browser journey before production promotion.
