import { supabase, SUPABASE_URL } from './supabase';

type OttCycle = 'audit' | 'launch';

type CheckoutResult = { ok: boolean; error?: string; onboardingId?: string };

type EdgeResponse<T> = { data: T | null; error: Error | null };

const PACKAGES: Record<OttCycle, { amountMajor: number; label: string; description: string }> = {
  audit: { amountMajor: 7500, label: 'OTT Readiness Audit', description: 'StreamVista OTT Readiness Audit' },
  launch: { amountMajor: 25000, label: 'OTT Launch Package', description: 'StreamVista OTT Launch Package' },
};

async function invoke<T>(functionName: string, accessToken: string, body: Record<string, unknown>): Promise<EdgeResponse<T>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(payload?.error || payload?.message || `Request failed (${response.status})`));
    return { data: payload as T, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Request failed') };
  }
}

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
    const { data: onboarding, error: onboardingError } = await supabase
      .from('onboarding_requests')
      .insert({ submitter_user_id: current.user.id, selected_cycle: cycle === 'audit' ? 'topup' : 'creator', payment_status: 'pending', onboarding_status: 'pending_payment', amount_paise: pkg.amountMajor * 100, currency: 'INR' })
      .select('id,selected_cycle,payment_status,amount_paise,currency')
      .single();
    if (onboardingError || !onboarding?.id) throw onboardingError || new Error('Could not create payment onboarding record');

    const orderResponse = await invoke<{ ok?: boolean; orderId?: string; keyId?: string; amount?: number; currency?: string }>('create-razorpay-order', current.access_token, { onboardingId: onboarding.id });
    if (orderResponse.error || !orderResponse.data?.ok || !orderResponse.data.orderId || !orderResponse.data.keyId) {
      await supabase.from('onboarding_requests').update({ payment_status: 'failed', onboarding_status: 'failed', updated_at: new Date().toISOString() }).eq('id', onboarding.id).eq('submitter_user_id', current.user.id);
      throw orderResponse.error || new Error('Unable to create Razorpay order');
    }
    if (Number(orderResponse.data.amount) !== pkg.amountMajor * 100 || String(orderResponse.data.currency || 'INR').toUpperCase() !== 'INR') {
      await supabase.from('onboarding_requests').update({ payment_status: 'failed', onboarding_status: 'failed', updated_at: new Date().toISOString() }).eq('id', onboarding.id).eq('submitter_user_id', current.user.id);
      throw new Error('Payment amount mismatch');
    }

    if (!(await loadRazorpay())) throw new Error('Razorpay checkout failed to load');

    return await new Promise<CheckoutResult>((resolve) => {
      const rzp = new window.Razorpay({
        key: orderResponse.data.keyId,
        amount: Number(orderResponse.data.amount),
        currency: orderResponse.data.currency || 'INR',
        name: 'StreamVista',
        description: pkg.description,
        order_id: orderResponse.data.orderId,
        prefill: { email: current.user.email ?? '' },
        notes: { onboarding_id: onboarding.id, package: cycle },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verified = await invoke<{ ok?: boolean; verified?: boolean }>('verify-razorpay-payment', current.access_token, {
            onboardingId: onboarding.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verified.error || verified.data?.verified !== true) {
            await supabase.from('onboarding_requests').update({ payment_status: 'failed', onboarding_status: 'failed', updated_at: new Date().toISOString() }).eq('id', onboarding.id).eq('submitter_user_id', current.user.id);
            resolve({ ok: false, error: verified.error?.message || 'Payment verification failed' });
            return;
          }
          resolve({ ok: true, onboardingId: onboarding.id });
        },
        modal: { ondismiss: async () => { await supabase.from('onboarding_requests').update({ updated_at: new Date().toISOString() }).eq('id', onboarding.id).eq('submitter_user_id', current.user.id); resolve({ ok: false, error: 'Payment checkout closed' }); } },
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
