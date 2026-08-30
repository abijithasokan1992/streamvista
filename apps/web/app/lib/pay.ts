import { supabase } from './supabase';

export type PaidCycle = 'creator' | 'topup';

const COMMAND_API_URL = 'https://command.streamvista.in';
const PLAN_AMOUNT_PAISE: Record<PaidCycle, number> = {
  creator: 76700,
  topup: 76700,
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

async function commandRequest<T>(path: string, accessToken: string, body: Record<string, unknown>, idempotencyKey?: string): Promise<T> {
  const response = await fetch(`${COMMAND_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error ?? `Payment API failed (${response.status})`);
  return data as T;
}

export async function startPlanCheckout(cycle: PaidCycle): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Auth is not configured' };

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user) return { ok: false, error: 'Login required' };

  const idempotencyKey = `plan:${session.user.id}:${cycle}:${crypto.randomUUID()}`;
  const amount = PLAN_AMOUNT_PAISE[cycle];

  const { data: row, error: insertErr } = await supabase
    .from('onboarding_requests')
    .insert({
      selected_cycle: cycle,
      submitter_user_id: session.user.id,
      payment_status: 'pending',
      onboarding_status: 'pending_payment',
      amount_paise: amount,
      currency: 'INR',
    })
    .select('id')
    .single();

  if (insertErr || !row?.id) return { ok: false, error: insertErr?.message ?? 'Could not create payment request' };

  try {
    const order = await commandRequest<{ success: boolean; order: { id: string; amount: number; currency: string; }; payment?: { id: string } }>('/api/payments/create-order', session.access_token, {
      onboardingId: row.id,
      amount,
      currency: 'INR',
      cycle,
    }, idempotencyKey);

    if (!order?.order?.id) throw new Error('Payment order was not created');
    const scriptOk = await loadCheckout();
    if (!scriptOk) throw new Error('Razorpay checkout failed to load');

    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) || '',
        amount: order.order.amount,
        currency: order.order.currency ?? 'INR',
        name: 'StreamVista',
        description: cycle === 'creator' ? 'Creator plan — 1 TB / month' : '1 TB storage top-up',
        order_id: order.order.id,
        prefill: { email: session.user.email ?? '' },
        theme: { color: '#22d3ee' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await commandRequest<{ success: boolean }>('/api/payments/verify', session.access_token, {
              onboardingId: row.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cycle,
            }, idempotencyKey);
            resolve(verified?.success ? { ok: true } : { ok: false, error: 'Payment verification failed' });
          } catch (error: any) {
            resolve({ ok: false, error: error?.message ?? 'Payment verification failed' });
          }
        },
      });
      if (!order.order.amount) {
        resolve({ ok: false, error: 'Invalid payment amount returned by server' });
        return;
      }
      rzp.open();
    });
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'Payment order failed' };
  }
}
