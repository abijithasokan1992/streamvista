# StreamVista Pay — UPI QR

## Canonical route

`/pay/upi`

## Architecture

- UI: `apps/web/app/pages/UPIQR.tsx`
- Route: `apps/web/app/App.tsx`
- QR generation: `qrcode-generator`
- Public configuration:
  - `VITE_UPI_VPA`
  - `VITE_UPI_PAYEE_NAME`
- Payment verification is deliberately separated from QR generation. The UI must never claim success without trusted backend/webhook confirmation.

## Deployment mapping

Deploy the existing `apps/web` Vite application. Do not create a second Vercel project for this feature.

Required Vercel project settings should point to the repository's web app build configuration and expose only the two public UPI variables above. Secrets must remain server-side.

## Production acceptance

1. `/pay/upi` loads on mobile.
2. QR is scannable by a UPI app.
3. Recipient name and VPA are visible before payment.
4. Amount and order reference are reflected in the UPI intent when supplied.
5. Copy/share/save actions work where supported.
6. Invalid/missing configuration fails safely.
7. No payment-success state is inferred from opening/scanning the QR.
8. Existing StreamVista routes remain unaffected.

## Important

This is an original StreamVista payment interface inspired by the supplied reference image. It does not use PhonePe proprietary branding or assets.
