# Crayons LOOP — Digital Streaming App

## Product identity
- Product: Crayons LOOP
- Positioning: Premium digital streaming service for films, series, shorts and curated video.
- Domain: www.crayonsloop.com
- Operator: StreamVista OPC Pvt Ltd

## Experience
Netflix-class information architecture and streaming UX, but original Crayons LOOP branding, content, copy, assets, and interaction design.

## Public app
- Home / featured hero
- Browse by genre, language, format and year
- Title detail pages
- Search
- Player
- Watchlist
- Continue Watching
- Account
- Subscription / billing
- Login / signup

## Authentication
Use Supabase Auth for customer signup, email/password login, email confirmation, sessions, logout and password recovery. Never expose service secrets in browser code. Use RLS for user-owned data.

## Subscription commerce
Razorpay is the payment provider. The application must use Razorpay subscriptions/plans through secure server-side integration.
- Keep Razorpay plan IDs in server-side configuration/database.
- Create subscription checkout server-side.
- Verify webhook signatures server-side.
- Persist subscription lifecycle events idempotently.
- Grant/revoke playback entitlement based on verified subscription state.
- Never treat a client-side payment callback alone as proof of payment.

## Admin-only CMS
Only administrators can access `/admin` and edit content. CMS capabilities:
- Titles
- Posters/backdrops/trailers/playback sources
- Genres
- Metadata
- Featured flags
- Publish/unpublish
- Subscription plans
- User/subscription overview
- Audit log

All CMS writes require authenticated admin authorization and server-side validation. Customer accounts must never receive admin privileges through client-controlled metadata.

## Database namespace
Use the `loop_*` tables for Crayons LOOP data and do not repurpose existing StreamVista or Crayons Bridge records.

## Existing reusable infrastructure
- Supabase Auth
- Existing RLS patterns
- Existing Razorpay payment infrastructure where compatible
- Existing reusable React/Vite UI components and design primitives from the StreamVista repository

## Architecture rule
Reuse before rebuild. Do not duplicate existing components or integrations without evidence that the current implementation is incompatible.

## Domain / deployment
Prepare the application for `www.crayonsloop.com` and the apex domain `crayonsloop.com`. Keep StreamVista production domains untouched.

## Release gate
Do not promote to production until:
1. Build/typecheck pass.
2. Customer signup/login/logout/session persistence work.
3. Published catalog loads from Supabase.
4. Admin-only CMS authorization is verified.
5. Razorpay subscription creation and webhook verification are proven with test transactions/events.
6. Subscription entitlement gates playback correctly.
7. Domain and HTTPS routing work.
8. No secrets are committed to Git.
