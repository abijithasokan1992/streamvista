import { authenticatedUser, json, razorpayAuth, serviceClient } from './_shared.mjs';

const PRICE_RULES = { creator: 76700, topup: 76700 };

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: 'Unauthenticated' });

    const cycle = String(request.body?.cycle || '').trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(PRICE_RULES, cycle)) return json(response, 422, { error: 'Unsupported plan' });
    const amount = PRICE_RULES[cycle];
    const idempotencyKey = String(request.headers['idempotency-key'] || request.body?.idempotencyKey || '').trim();
    if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return json(response, 400, { error: 'A valid Idempotency-Key is required' });
    }

    const { data: row, error: insertError } = await client
      .from('onboarding_requests')
      .insert({
        selected_cycle: cycle,
        submitter_user_id: user.id,
        payment_status: 'pending',
        onboarding_status: 'pending_payment',
        amount_paise: amount,
        currency: 'INR',
      })
      .select('id')
      .single();
    if (insertError || !row?.id) return json(response, 500, { error: 'Could not create payment record' });

    const receipt = `sv_${row.id.replaceAll('-', '').slice(0, 24)}`;
    const upstream = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: razorpayAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { user_id: user.id, onboarding_id: row.id, product: cycle } }),
    });
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok || !payload?.id) return json(response, 502, { error: 'Payment provider is temporarily unavailable' });

    const { error: updateError } = await client
      .from('onboarding_requests')
      .update({ razorpay_order_id: payload.id, payment_status: 'created', amount_paise: amount, currency: 'INR' })
      .eq('id', row.id)
      .eq('submitter_user_id', user.id);
    if (updateError) return json(response, 500, { error: 'Payment ledger update failed' });

    const { error: paymentError } = await client
      .from('sv_payments')
      .upsert({
        user_id: user.id,
        provider: 'razorpay',
        provider_order_id: payload.id,
        amount: amount / 100,
        currency: 'INR',
        purpose: `plan:${cycle}`,
        status: 'created',
        idempotency_key: idempotencyKey,
      }, { onConflict: 'idempotency_key' });
    if (paymentError) return json(response, 500, { error: 'Payment ledger update failed' });

    return json(response, 200, {
      ok: true,
      orderId: payload.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      onboardingId: row.id,
    });
  } catch (error) {
    console.error('create-plan-order failed', error instanceof Error ? error.message : 'unknown');
    return json(response, 503, { error: 'Payment service is not available' });
  }
}
