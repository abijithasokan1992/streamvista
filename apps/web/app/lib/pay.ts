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

export async function startPlanCheckout(cycle: PaidCycle): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Auth is not configured' };

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session?.access_token || !session.user) {
    return { ok: false, error: 'Login required' };
  }

  const { data: row, error: insertErr } = await supabase
    .from('onboarding_requests')
    .insert({
      selected_cycle: cycle,
      submitter_user_id: session.user.id,
      payment_status: 'pending',
      onboarding_status: 'pending_payment',
    })
    .select('id')
    .single();

  if (insertErr || !row?.id) {
    return { ok: false, error: insertErr?.message ?? 'Could not create order row' };
  }

  const { data: order, error: orderErr } = await supabase.functions.invoke('create-razorpay-order', {
    body: { onboardingId: row.id },
  });
  if (orderErr || !order?.orderId || !order?.keyId) {
    return { ok: false, error: order?.error ?? orderErr?.message ?? 'Order create failed' };
  }

  const scriptOk = await loadCheckout();
  if (!scriptOk) return { ok: false, error: 'Razorpay checkout failed to load' };

  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency ?? 'INR',
      name: 'StreamVista',
      description: cycle === 'creator' ? 'Creator plan' : '1 TB top-up',
      order_id: order.orderId,
      prefill: { email: session.user.email ?? '' },
      theme: { color: '#22d3ee' },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const { data: verified, error: verifyErr } = await supabase.functions.invoke(
          'verify-razorpay-payment',
          {
            body: {
              onboardingId: row.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          },
        );
        if (verifyErr || !verified?.verified) {
          resolve({ ok: false, error: verifyErr?.message ?? 'Payment verification failed' });
          return;
        }
        resolve({ ok: true });
      },
    });
    rzp.open();
  });
}
