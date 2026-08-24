import { authenticatedUser, integerPaise, json, razorpayAuth, safeCurrency, serviceClient } from "./_shared.mjs";

const SERVICE = {
  id: "creator-content-qc",
  name: "StreamVista Creator Content QC & Delivery Setup",
  amount: 4999,
  currency: "INR",
};

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });

  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: "Sign in required" });

    const currency = safeCurrency(SERVICE.currency);
    const amount = integerPaise(SERVICE.amount);
    const idempotencyKey = String(request.headers["idempotency-key"] || "").trim();
    if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return json(response, 400, { error: "A valid Idempotency-Key is required" });
    }

    const { data: existing, error: existingError } = await client
      .from("sv_payments")
      .select("id, provider_order_id, provider_payment_id, amount, currency, status, purpose, created_at")
      .eq("user_id", user.id)
      .eq("purpose", "creator_content_qc")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return json(response, 200, { payment: existing, service: SERVICE, idempotent: true, razorpay: { orderId: existing.provider_order_id, keyId: process.env.RAZORPAY_KEY_ID } });

    const receipt = `svsvc_${user.id.replaceAll("-", "").slice(0, 12)}_${Date.now()}`;
    const upstream = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: razorpayAuth(), "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, receipt, notes: { service_id: SERVICE.id, service_name: SERVICE.name, purpose: "creator_content_qc" } }),
    });
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok || !payload?.id) return json(response, 502, { error: "Payment provider is temporarily unavailable" });

    const { data: payment, error: insertError } = await client
      .from("sv_payments")
      .insert({
        org_id: null,
        user_id: user.id,
        title_id: null,
        deal_id: null,
        purpose: "creator_content_qc",
        provider: "razorpay",
        provider_order_id: payload.id,
        amount: SERVICE.amount,
        currency,
        status: "created",
        idempotency_key: idempotencyKey,
      })
      .select("id, provider_order_id, amount, currency, status, purpose, created_at")
      .single();
    if (insertError) throw insertError;

    return json(response, 201, { payment, service: SERVICE, razorpay: { orderId: payload.id, keyId: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    console.error("Service payment order failed", error instanceof Error ? error.message : "unknown");
    const status = error instanceof Error && /not configured|canonical|credentials/.test(error.message) ? 503 : 500;
    return json(response, status, { error: "Payment service is not available" });
  }
}
