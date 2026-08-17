import {
  authenticatedUser,
  integerPaise,
  json,
  razorpayAuth,
  safeCurrency,
  serviceClient,
} from "./_shared.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });

  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: "Unauthenticated" });

    const { data: profile, error: profileError } = await client
      .from("sv_app_profiles")
      .select("id, app_role, verification_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.app_role !== "buyer" || !["verified", "approved"].includes(profile.verification_status)) {
      return json(response, 403, { error: "Verified buyer access is required" });
    }

    const input = request.body && typeof request.body === "object" ? request.body : {};
    const dealId = String(input.dealId || "").trim();
    const idempotencyKey = String(request.headers["idempotency-key"] || input.idempotencyKey || "").trim();
    if (!dealId || !idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return json(response, 400, { error: "dealId and a valid Idempotency-Key are required" });
    }

    const { data: existing, error: existingError } = await client
      .from("sv_payments")
      .select("id, provider_order_id, provider_payment_id, amount, currency, status, purpose, created_at")
      .eq("user_id", user.id)
      .eq("deal_id", dealId)
      .eq("purpose", "marketplace_deal")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return json(response, 200, { payment: existing, idempotent: true });

    const { data: deal, error: dealError } = await client
      .from("sv_marketplace_deals")
      .select("id, buyer_id, title_id, stage, offer_amount, currency, payment_status")
      .eq("id", dealId)
      .eq("buyer_id", user.id)
      .maybeSingle();
    if (dealError) throw dealError;
    if (!deal) return json(response, 404, { error: "Deal not found" });
    if (deal.stage !== "payment_pending") return json(response, 409, { error: "Deal is not ready for payment" });
    if (["paid", "captured", "refunded"].includes(String(deal.payment_status || "").toLowerCase())) {
      return json(response, 409, { error: "Deal is already paid" });
    }

    const amount = integerPaise(deal.offer_amount);
    const currency = safeCurrency(deal.currency);
    const receipt = `sv_${deal.id.replaceAll("-", "").slice(0, 24)}_${Date.now()}`;

    const upstream = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: razorpayAuth(), "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency, receipt, notes: { streamvista_deal_id: deal.id, purpose: "marketplace_deal" } }),
    });
    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok || !payload?.id) {
      console.error("Razorpay order creation failed", upstream.status, payload?.error?.code || "unknown");
      return json(response, 502, { error: "Payment provider is temporarily unavailable" });
    }

    const row = {
      org_id: null,
      user_id: user.id,
      title_id: deal.title_id,
      deal_id: deal.id,
      purpose: "marketplace_deal",
      provider: "razorpay",
      provider_order_id: payload.id,
      amount: deal.offer_amount,
      currency,
      status: "created",
      idempotency_key: idempotencyKey,
    };
    const { data: payment, error: insertError } = await client
      .from("sv_payments")
      .insert(row)
      .select("id, provider_order_id, amount, currency, status, purpose, created_at")
      .single();
    if (insertError) {
      if (insertError.code === "23505") {
        const { data: raced } = await client
          .from("sv_payments")
          .select("id, provider_order_id, provider_payment_id, amount, currency, status, purpose, created_at")
          .eq("user_id", user.id)
          .eq("deal_id", deal.id)
          .eq("purpose", "marketplace_deal")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (raced) return json(response, 200, { payment: raced, idempotent: true });
      }
      throw insertError;
    }

    return json(response, 201, {
      payment,
      razorpay: { orderId: payload.id, keyId: process.env.RAZORPAY_KEY_ID },
    });
  } catch (error) {
    console.error("Payment order handler failed", error instanceof Error ? error.message : "unknown");
    const status = error instanceof Error && /not configured|canonical|credentials/.test(error.message) ? 503 : 500;
    return json(response, status, { error: "Payment service is not available" });
  }
}
