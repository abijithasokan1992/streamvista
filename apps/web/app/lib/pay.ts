import { supabase } from './supabase';

export type PaidCycle = 'creator' | 'topup';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (payload: unknown) => void) => void };
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
  if (!response.ok || !payload?.ok) {
    throw new Error(String(payload?.error?.message || payload?.message || `Request failed (${response.status})`));
  }
  return payload.data;
}

function idempotencyKey(userId: string, seed: string) {
  return `${userId}:${seed}:${Date.now()}:${Math.random().toString(36).slice(2)}`.replace(/[^A-Za-z0-9._:-]/g, '-').slice(0, 96);
}

export async function startCheckout(input: { amountMajor: number; description?: string; titleId?: string; dealId?: string; cycle?: PaidCycle }): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Auth is not configured' };
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user) return { ok: false, error: 'Login required' };

  const amountMajor = Number(input.amountMajor);
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) return { ok: false, error: 'Invalid payment amount' };

  try {
    const seed = input.cycle || input.dealId || input.titleId || 'payment';
    const key = idempotencyKey(session.user.id, seed);
    const onboarding = await apiPost('/api/payments/create-order', session.access_token, {
      amount: amountMajor,
      titleId: input.titleId,
      dealId: input.dealId,
      cycle: input.cycle,
      idempotencyKey: key,
    }, { 'Idempotency-Key': key });

    const order = onboarding?.order || {};
    const orderId = onboarding?.orderId ?? order.id;
    const amountPaise = Number(onboarding?.amount ?? order.amount);
    const keyId = onboarding?.keyId ?? onboarding?.razorpay?.keyId;
    const currency = onboarding?.currency ?? order.currency ?? 'INR';

    if (!orderId || !keyId || !Number.isFinite(amountPaise) || amountPaise <= 0) return { ok: false, error: onboarding?.error ?? 'Order create failed' };
    if (Math.round(amountMajor * 100) !== amountPaise) return { ok: false, error: 'Payment amount mismatch' };

    if (!(await loadCheckout())) return { ok: false, error: 'Razorpay checkout failed to load' };

    return await new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount: amountPaise,
        currency,
        name: 'StreamVista',
        description: input.description || 'StreamVista payment',
        order_id: orderId,
        prefill: { email: session.user.email ?? '' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verified = await apiPost('/api/payments/verify', session.access_token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              titleId: input.titleId,
              dealId: input.dealId,
              cycle: input.cycle,
            }, { 'Idempotency-Key': `${response.razorpay_order_id}:${response.razorpay_payment_id}` });
            resolve({ ok: verified?.verified === true });
          } catch (error) {
            resolve({ ok: false, error: error instanceof Error ? error.message : 'Payment verification failed' });
          }
        },
        modal: { ondismiss: () => resolve({ ok: false, error: 'Payment checkout closed' }) },
      });
      rzp.open();
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Payment service is not available' };
  }
}

export async function startPlanCheckout(cycle: PaidCycle): Promise<{ ok: boolean; error?: string }> {
  const amountMajor = cycle === 'creator' || cycle === 'topup' ? 767 : 0;
  return startCheckout({ amountMajor, cycle, description: cycle === 'creator' ? 'Creator plan' : '1 TB top-up' });
}