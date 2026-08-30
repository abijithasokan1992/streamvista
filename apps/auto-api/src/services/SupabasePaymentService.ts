import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are not configured');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class SupabasePaymentService {
  static async createPayment(input: {
    userId: string;
    titleId?: string | null;
    dealId?: string | null;
    amount: number;
    currency: string;
    providerOrderId: string;
    idempotencyKey: string;
    purpose: string;
  }) {
    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from('sv_payments')
      .select('*')
      .eq('idempotency_key', input.idempotencyKey)
      .maybeSingle();
    if (existing) return existing;

    const { data, error } = await supabase
      .from('sv_payments')
      .insert({
        user_id: input.userId,
        title_id: input.titleId || null,
        deal_id: input.dealId || null,
        amount: input.amount,
        currency: input.currency,
        purpose: input.purpose,
        provider: 'razorpay',
        provider_order_id: input.providerOrderId,
        idempotency_key: input.idempotencyKey,
        status: 'created',
      })
      .select('*')
      .single();
    if (error) throw new Error(`Payment persistence failed: ${error.message}`);
    return data;
  }

  static async markVerified(input: {
    paymentId?: string;
    providerOrderId: string;
    providerPaymentId: string;
  }) {
    const supabase = getServiceClient();
    const query = supabase.from('sv_payments').update({
      provider_payment_id: input.providerPaymentId,
      status: 'authorized',
      verified_at: new Date().toISOString(),
    }).eq('provider_order_id', input.providerOrderId);
    const { data, error } = await query.select('*').maybeSingle();
    if (error) throw new Error(`Payment verification persistence failed: ${error.message}`);
    return data;
  }

  static async applyWebhook(input: {
    eventId: string;
    eventName: string;
    payloadHash: string;
    providerPaymentId?: string;
    providerOrderId?: string;
    status: 'authorized' | 'captured' | 'failed' | 'refunded';
    receivedAt: string;
  }) {
    const supabase = getServiceClient();
    const { data: prior } = await supabase
      .from('sv_payment_webhook_events')
      .select('event_id')
      .eq('event_id', input.eventId)
      .maybeSingle();
    if (prior) return { duplicate: true };

    let paymentId: string | null = null;
    if (input.providerOrderId) {
      const { data: payment } = await supabase
        .from('sv_payments')
        .select('id')
        .eq('provider_order_id', input.providerOrderId)
        .maybeSingle();
      paymentId = payment?.id || null;
    }

    const { error: eventError } = await supabase.from('sv_payment_webhook_events').insert({
      event_id: input.eventId,
      event_name: input.eventName,
      payload_hash: input.payloadHash,
      status: 'received',
      payment_id: paymentId,
      received_at: input.receivedAt,
    });
    if (eventError) throw new Error(`Webhook persistence failed: ${eventError.message}`);

    if (paymentId) {
      const { error: paymentError } = await supabase
        .from('sv_payments')
        .update({
          provider_payment_id: input.providerPaymentId || undefined,
          status: input.status,
          raw_event_hash: input.payloadHash,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);
      if (paymentError) throw new Error(`Payment status update failed: ${paymentError.message}`);

      const { error: processedError } = await supabase
        .from('sv_payment_webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('event_id', input.eventId);
      if (processedError) throw new Error(`Webhook completion update failed: ${processedError.message}`);
    }

    return { duplicate: false, paymentId };
  }

  static async getUserRevenue(userId: string) {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('sv_payments')
      .select('id,user_id,title_id,deal_id,purpose,provider,provider_order_id,provider_payment_id,amount,currency,status,verified_at,created_at')
      .eq('user_id', userId)
      .in('status', ['authorized', 'captured'])
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Revenue query failed: ${error.message}`);
    return data || [];
  }
}
