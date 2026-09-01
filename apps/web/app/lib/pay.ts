import { supabase } from './supabase';

export type PaidCycle = 'creator' | 'topup';

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

async function apiPost(path: string, token: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload?.error || payload?.message || `Request failed (${response.status})`));
  }
  return payload;
}

function idempotencyKey(userId: string, cycle: PaidCycle) {
  const seed = `${userId}:${cycle}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return seed.replace(/[^A-Za-z0-9._:-]/g, '-').slice(0, 96);
}

export async function startPlanCheckout(cycle: PaidCycle): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Auth is not configured' };

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user) {
    return { ok: false, error: 'Login required' };
  }

  try {
    const key = idempotencyKey(session.user.id, cycle);
    const onboarding = await apiPost('/api/payments/create-order', session.access_token, {
      cycle,
      idempotencyKey: key,
    }, { 'Idempotency-Key': key });

    const order = onboarding?.order;
    const payment = onboarding?.payment;
    const orderId = order?.id;
    const amount = Number(order?.amount);
    const keyId = onboarding?.keyId ?? onboarding?.razorpay?.keyId;
    const currency = order?.currency ?? 'INR';

    if (!orderId || !keyId || !Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: onboarding?.error ?? 'Order create failed' };
    }

    const scriptOk = await loadCheckout();
    if (!scriptOk) return { ok: false, error: 'Razorpay checkout failed to load' };

    return await new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'StreamVista',
        description: cycle === 'creator' ? 'Creator plan' : '1 TB top-up',
        order_id: orderId,
        prefill: { email: session.user.email ?? '' },
        theme: { color: '#22d3ee' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verified = await apiPost('/api/payments/verify', session.access_token, {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              cycle,
              paymentIdHint: payment?.id ?? null,
            }, { 'Idempotency-Key': `${response.razorpay_order_id}:${response.razorpay_payment_id}` });
            resolve({ ok: verified?.verified === true });
          } catch (error) {
            resolve({ ok: false, error: error instanceof Error ? error.message : 'Payment verification failed' });
          }
        },
        modal: {
          ondismiss: () => resolve({ ok: false, error: 'Payment checkout closed' }),
        },
      });
      rzp.open();
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Payment service is not available' };
  }
}