import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function json(response, status, body) {
  response.status(status).setHeader("Cache-Control", "no-store").setHeader("Content-Type", "application/json; charset=utf-8");
  return response.json(body);
}

function requireRazorpaySecrets() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!keyId || !keySecret || !webhookSecret) throw new Error("Razorpay production credentials are not configured");
  return { keyId, keySecret, webhookSecret };
}

function verifySignature(secret, rawBody, signature) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(String(signature), "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function payloadHash(rawBody) {
  return createHmac("sha256", "streamvista-webhook-hash").update(rawBody).digest("hex");
}

async function readRawBody(request, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new Error("Payload too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function serviceClient() {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function paymentEntity(payload) { return payload?.payload?.payment?.entity || null; }
function orderEntity(payload) { return payload?.payload?.order?.entity || null; }
function refundEntity(payload) { return payload?.payload?.refund?.entity || null; }

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" });

  let client = null;
  let eventId = null;
  try {
    const { keyId, keySecret, webhookSecret } = requireRazorpaySecrets();
    // Read the key pair here so production configuration is validated even though
    // webhook authenticity itself is established with RAZORPAY_WEBHOOK_SECRET.
    void keyId;
    void keySecret;

    const rawBody = await readRawBody(request);
    if (!verifySignature(webhookSecret, rawBody, request.headers["x-razorpay-signature"])) {
      return json(response, 401, { error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody);
    eventId = String(request.headers["x-razorpay-event-id"] || payload?.event_id || "").trim();
    const eventName = String(payload?.event || "").trim();
    if (!eventId || !eventName) return json(response, 400, { error: "Missing webhook event identity" });

    client = serviceClient();
    const hash = payloadHash(rawBody);
    const payment = paymentEntity(payload);
    const order = orderEntity(payload);
    const refund = refundEntity(payload);
    const paymentId = payment?.id || refund?.payment_id || null;
    const orderId = payment?.order_id || order?.id || null;

    const { data: existing, error: existingError } = await client
      .from("razorpay_webhook_ledger")
      .select("event_id, status")
      .eq("event_id", eventId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing?.status === "processed") return json(response, 200, { received: true, duplicate: true });

    const { error: ledgerInsertError } = await client.from("razorpay_webhook_ledger").insert({
      event_id: eventId,
      event_name: eventName,
      payload_hash: hash,
      provider_payment_id: paymentId,
      provider_order_id: orderId,
      amount: payment?.amount ?? refund?.amount ?? null,
      currency: payment?.currency ?? refund?.currency ?? null,
      status: "received",
      raw_payload: payload,
    });
    if (ledgerInsertError && ledgerInsertError.code !== "23505") throw ledgerInsertError;

    let dealId = null;
    const captured = eventName === "payment.captured" || eventName === "order.paid";
    const authorized = eventName === "payment.authorized";
    const failed = eventName === "payment.failed";
    const refunded = eventName === "refund.created" || eventName === "refund.processed";

    if (paymentId && (captured || authorized || failed)) {
      const nextStatus = captured ? "captured" : authorized ? "authorized" : "failed";
      const update = {
        provider_payment_id: paymentId,
        provider_order_id: orderId || undefined,
        provider_event_id: eventId,
        status: nextStatus,
        verified_at: new Date().toISOString(),
        raw_event_hash: hash,
      };
      if (payment?.error_reason) update.error_reason = payment.error_reason;

      const { data, error } = await client
        .from("sv_payments")
        .update(update)
        .eq("provider", "razorpay")
        .eq("provider_order_id", orderId)
        .select("id, deal_id")
        .maybeSingle();
      if (error) throw error;
      dealId = data?.deal_id || null;

      if (dealId) {
        const { error: dealError } = await client
          .from("sv_marketplace_deals")
          .update({ payment_status: captured ? "paid" : nextStatus })
          .eq("id", dealId);
        if (dealError) throw dealError;
      }
    } else if (refunded && refund?.payment_id) {
      const { data, error } = await client
        .from("sv_payments")
        .select("id, deal_id")
        .eq("provider", "razorpay")
        .eq("provider_payment_id", refund.payment_id)
        .maybeSingle();
      if (error) throw error;
      dealId = data?.deal_id || null;
      if (data?.id) {
        const { error: paymentError } = await client.from("sv_payments").update({
          status: "refunded",
          provider_event_id: eventId,
          raw_event_hash: hash,
          verified_at: new Date().toISOString(),
        }).eq("id", data.id);
        if (paymentError) throw paymentError;
      }
      if (dealId) {
        const { error: dealError } = await client.from("sv_marketplace_deals").update({ payment_status: "refunded" }).eq("id", dealId);
        if (dealError) throw dealError;
      }
    }

    const { error: ledgerUpdateError } = await client
      .from("razorpay_webhook_ledger")
      .update({ deal_id: dealId, status: "processed", processed_at: new Date().toISOString() })
      .eq("event_id", eventId);
    if (ledgerUpdateError) throw ledgerUpdateError;

    return json(response, 200, { received: true, processed: true, event_id: eventId });
  } catch (error) {
    console.error("Razorpay webhook failed", error instanceof Error ? error.message : "unknown");
    if (client && eventId) {
      await client.from("razorpay_webhook_ledger").update({ status: "failed" }).eq("event_id", eventId).catch(() => {});
    }
    return json(response, 500, { error: "Webhook processing failed" });
  }
}
