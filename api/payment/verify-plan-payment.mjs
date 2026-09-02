import { authenticatedUser, json, razorpayAuth, serviceClient, verifyCheckoutSignature } from './_shared.mjs';

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: 'Unauthenticated' });

    const onboardingId = String(request.body?.onboardingId || '').trim();
    const orderId = String(request.body?.razorpay_order_id || '').trim();
    const paymentId = String(request.body?.razorpay_payment_id || '').trim();
    const signature = String(request.body?.razorpay_signature || '').trim();
    if (!onboardingId || !orderId || !paymentId || !signature) {
      return json(response, 400, { error: 'Payment verification fields are required' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret || !verifyCheckoutSignature(secret, orderId, paymentId, signature)) {
      return json(response, 400, { error: 'Invalid payment signature' });
    }

    const { data: onboarding, error: lookupError } = await client
      .from('onboarding_requests')
      .select('id,submitter_user_id,selected_cycle,payment_status,razorpay_order_id,amount_paise,currency')
      .eq('id', onboardingId)
      .eq('submitter_user_id', user.id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!onboarding) return json(response, 404, { error: 'Payment record not found' });
    if (onboarding.razorpay_order_id !== orderId) return json(response, 409, { error: 'Payment order mismatch' });

    const upstream = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: razorpayAuth() },
    });
    const providerPayment = await upstream.json().catch(() => null);
    if (!upstream.ok || providerPayment?.order_id !== orderId) {
      return json(response, 409, { error: 'Payment provider verification failed' });
    }
    if (Number(providerPayment?.amount) !== Number(onboarding.amount_paise)) {
      return json(response, 409, { error: 'Payment amount mismatch' });
    }

    const status = providerPayment.captured ? 'captured' : providerPayment.status === 'authorized' ? 'authorized' : providerPayment.status === 'failed' ? 'failed' : onboarding.payment_status;
    const { error: updateError } = await client
      .from('onboarding_requests')
      .update({
        payment_status: status,
        onboarding_status: status === 'captured' ? 'active' : status === 'failed' ? 'failed' : 'pending_payment',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        payment_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId)
      .eq('submitter_user_id', user.id);
    if (updateError) throw updateError;

    const { error: paymentError } = await client
      .from('sv_payments')
      .update({
        provider_payment_id: paymentId,
        status,
        verified_at: new Date().toISOString(),
      })
      .eq('provider_order_id', orderId)
      .eq('provider', 'razorpay')
      .eq('user_id', user.id);
    if (paymentError) throw paymentError;

    return json(response, 200, { ok: status === 'captured', verified: status === 'captured', paymentStatus: status });
  } catch (error) {
    console.error('verify-plan-payment failed', error instanceof Error ? error.message : 'unknown');
    return json(response, 503, { error: 'Payment verification is not available' });
  }
}
