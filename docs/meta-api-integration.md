# Meta API Integration Contract

Meta is an optional integration layer for StreamVista. It is not an authentication or payment authority.

## Scope
- Meta Graph / Instagram / Messenger integrations may be enabled only when the required Meta app credentials and approved permissions are configured.
- Meta Model API may be used only when its corresponding credentials/configuration are present.
- No credential values belong in source control.
- Missing configuration must result in a truthful `not_configured` state, never a fake connected state.

## Existing authorities preserved
- Supabase Auth remains the canonical user identity provider.
- Supabase RLS remains the data authorization boundary.
- Razorpay remains the payment provider and server-side verification authority.
- Vercel remains the canonical deployment target.

## Production environment contract
Public/client-safe configuration may use the Vite `VITE_` prefix only for non-secret Meta identifiers that the provider explicitly allows to be public.
Server-only Meta credentials must remain server environment variables without a `VITE_` prefix.

Required values are feature-specific and must be added only when the corresponding Meta capability is actually enabled; do not invent or hard-code placeholders.

## Release rule
Meta integration must never block the existing StreamVista core user/revenue path unless a current feature explicitly depends on it.
