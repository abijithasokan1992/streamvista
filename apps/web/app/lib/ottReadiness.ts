import { supabase } from './supabase';

type OttCycle = 'audit' | 'launch';
type CheckoutResult = { ok: boolean; error?: string; onboardingId?: string };

type EdgePayload = { ok?: boolean; orderId?: string; keyId?: string; amount?: number; currency?: string; onboardingId?: string };

const PACKAGES: Record<OttCycle, { amountMajor: number; label: string; description: string }> = {
  audit: { amountMajor: 7500, label: 'OTT Readiness Audit', description: 'StreamVista OTT Readiness Audit' },
  launch: { amountMajor: 25000, label: 'OTT Launch Package', description: 'StreamVista OTT Launch Package' },
};

async function session() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function ottPackage(cycle: OttCycle) {
  return PACKAGES[cycle];
}

export async function startOttReadinessCheckout(cycle: OttCycle): Promise<CheckoutResult> {
  if (!supabase) return { ok: false, error: 'Authentication is not configured for this deployment.' };
  const current = await session();
  if (!current?.access_token || !current.user) return { ok: false, error: 'Login required' };

  const pkg = PACKAGES[cycle];
  try {
    const { data: orderResponse, error: orderError } = await supabase.functions.invoke<EdgePayload>('create-razorpay-order', {
      body: { ottPackage: cycle },
    });
    if (orderError || !orderResponse?.ok || !orderResponse.orderId || !orderResponse.keyId || !orderResponse.onboardingId) {
      throw orderError || new Error('Unable to create Razorpay order');
    }
    if (Number(orderResponse.amount) !== pkg.amountMajor * 100 || String(orderResponse.currency || 'INR').toUpperCase() !== 'INR') {
      throw new Error('Payment amount mismatch');
    }

    if (!(await loadRazorpay())) throw new Error('Razorpay checkout failed to load');

    return await new Promise<CheckoutResult>((resolve) => {
      const rzp = new window.Razorpay({
        key: orderResponse.keyId,
        amount: Number(orderResponse.amount),
        currency: orderResponse.currency || 'INR',
        name: 'StreamVista',
        description: pkg.description,
        order_id: orderResponse.orderId,
        prefill: { email: current.user.email ?? '' },
        notes: { onboarding_id: orderResponse.onboardingId, package: cycle },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const { data: verified, error: verifyError } = await supabase.functions.invoke<{ ok?: boolean; verified?: boolean }>('verify-razorpay-payment', {
            body: {
              onboardingId: orderResponse.onboardingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (verifyError || verified?.verified !== true) {
            resolve({ ok: false, error: verifyError?.message || 'Payment verification failed' });
            return;
          }
          resolve({ ok: true, onboardingId: orderResponse.onboardingId });
        },
        modal: { ondismiss: () => resolve({ ok: false, error: 'Payment checkout closed' }) },
      });
      rzp.open();
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Payment service is not available' };
  }
}

async function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}
