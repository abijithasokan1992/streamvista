import { getDbClient } from '../config/db';

export class OrderService {
  static async createOrder(orderData: any) {
    const { userId, titleId, dealId, purpose, amount, currency = 'INR', paymentId, orderId } = orderData;
    const client = getDbClient();

    const { data, error } = await client
      .from('sv_payments')
      .insert({
        user_id: userId || null,
        title_id: titleId || null,
        deal_id: dealId || null,
        purpose: purpose || 'order',
        amount: Number(amount || 0),
        currency,
        provider: 'razorpay',
        provider_order_id: orderId || null,
        provider_payment_id: paymentId || null,
        status: paymentId ? 'captured' : 'created',
        verified_at: paymentId ? new Date().toISOString() : null,
      })
      .select('id,provider_order_id,provider_payment_id,status,amount,currency,created_at')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getOrdersByCustomer(userId: string) {
    const { data, error } = await getDbClient()
      .from('sv_payments')
      .select('id,title_id,deal_id,purpose,provider_order_id,provider_payment_id,amount,currency,status,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getOrderDetails(paymentId: string) {
    const { data, error } = await getDbClient()
      .from('sv_payments')
      .select('id,user_id,title_id,deal_id,purpose,provider,provider_order_id,provider_payment_id,amount,currency,status,verified_at,created_at')
      .eq('id', paymentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Payment/order not found');
    return { ...data, items: [] };
  }
}
