import { authenticatedUser, json, razorpayAuth, serviceClient, verifyCheckoutSignature } from "./_shared.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });

  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: "Unauthenticated" });

    const input = request.body && typeof request.body === "object" ? request.body : {};
    const orderId = String(input.razorpay_order_id || "").trim();
    const paymentId = String(input.razorpay_payment_id || "").trim();
    const signature = String(input.razorpay_signature || "").trim();
    if (!orderId || !paymentId || !signature) return json(response, 400, { error: "Razorpay payment verification fields are required" });

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret || !verifyCheckoutSignature(secret, orderId, paymentId, signature)) {
      return json(response, 400, { error: "Invalid payment signature" });
    }

    const { data: payment, error: paymentError } = await client
      .from("sv_payments")
      .select("id, user_id, deal_id, provider_order_id, provider_payment_id, amount, currency, status")
      .eq("provider", "razorpay")
      .eq("provider_order_id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!payment) return json(response, 404, { error: "Payment order not found" });

    const upstream = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: razorpayAuth() },
    });
    const providerPayment = await upstream.json().catch(() => null);
    if (!upstream.ok || providerPayment?.order_id !== orderId) return json(response, 409, { error: "Payment provider verification failed" });

    const nextStatus = providerPayment.captured ? "captured" : providerPayment.status === "authorized" ? "authorized" : providerPayment.status === "failed" ? "failed" : payment.status;
    const { data: updated, error: updateError } = await client
      .from("sv_payments")
      .update({
        provider_payment_id: paymentId,
        status: nextStatus,
        verified_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .select("id, provider_order_id, provider_payment_id, amount, currency, status")
      .single();
    if (updateError) throw updateError;

    if (payment.deal_id && nextStatus === "captured") {
      await client.from("sv_marketplace_deals").update({ payment_status: "paid" }).eq("id", payment.deal_id);
    }

    return json(response, 200, { payment: updated, source_of_truth: "razorpay_api" });
  } catch (error) {
    console.error("Payment verification handler failed", error instanceof Error ? error.message : "unknown");
    const status = error instanceof Error && /not configured|canonical|credentials/.test(error.message) ? 503 : 500;
    return json(response, status, { error: "Payment verification is not available" });
  }
}
