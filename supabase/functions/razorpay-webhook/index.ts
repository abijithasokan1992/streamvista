import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const C = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-razorpay-event-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...C, "Content-Type": "application/json" },
  });

async function hmacSha256(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return [...new Uint8Array(signature)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(body: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: C });
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")?.trim();
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret || !url || !serviceRole) return json({ ok: false, error: "webhook_not_configured" }, 503);

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const expected = await hmacSha256(secret, raw);
  if (!signature || signature.length !== 64 || expected !== signature) {
    return json({ ok: false, error: "invalid_webhook_signature" }, 401);
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const eventId = (
    request.headers.get("x-razorpay-event-id") ||
    payload?.event_id ||
    payload?.id ||
    ""
  ).trim();
  const event = String(payload?.event || "").trim();
  if (!eventId || !event) return json({ ok: false, error: "missing_event_identity" }, 400);

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const payloadHash = await sha256(raw);

  const { data: existing, error: existingError } = await db
    .from("sv_payment_webhook_events")
    .select("event_id,status")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existingError) return json({ ok: false, error: "webhook_ledger_lookup_failed" }, 500);
  if (existing?.status === "processed") return json({ received: true, duplicate: true });

  if (!existing) {
    const { error: insertError } = await db.from("sv_payment_webhook_events").insert({
      event_id: eventId,
      event_name: event,
      payload_hash: payloadHash,
      status: "received",
    });
    if (insertError && insertError.code !== "23505") {
      return json({ ok: false, error: "webhook_ledger_insert_failed" }, 500);
    }
  }

  const payment = payload?.payload?.payment?.entity || null;
  const order = payload?.payload?.order?.entity || null;
  let paymentRowId: string | null = null;

  const paymentEvents = ["payment.captured", "payment.authorized", "payment.failed"];
  if (paymentEvents.includes(event) && payment?.id && payment?.order_id) {
    const status =
      event === "payment.captured"
        ? "captured"
        : event === "payment.authorized"
          ? "authorized"
          : "failed";

    const { data, error } = await db
      .from("sv_payments")
      .update({
        provider_payment_id: payment.id,
        provider_order_id: payment.order_id,
        provider_event_id: eventId,
        status,
        verified_at: new Date().toISOString(),
        raw_event_hash: payloadHash,
      })
      .eq("provider_order_id", payment.order_id)
      .eq("provider", "razorpay")
      .select("id,deal_id")
      .maybeSingle();
    if (error) return json({ ok: false, error: "payment_update_failed" }, 500);
    paymentRowId = data?.id || null;
    if (data?.deal_id && status === "captured") {
      await db.from("sv_marketplace_deals").update({ payment_status: "paid" }).eq("id", data.deal_id);
    }
  } else if (event === "order.paid" && order?.id && payment?.id) {
    const { data, error } = await db
      .from("sv_payments")
      .update({
        provider_payment_id: payment.id,
        provider_event_id: eventId,
        status: "captured",
        verified_at: new Date().toISOString(),
        raw_event_hash: payloadHash,
      })
      .eq("provider_order_id", order.id)
      .eq("provider", "razorpay")
      .select("id,deal_id")
      .maybeSingle();
    if (error) return json({ ok: false, error: "payment_update_failed" }, 500);
    paymentRowId = data?.id || null;
    if (data?.deal_id) {
      await db.from("sv_marketplace_deals").update({ payment_status: "paid" }).eq("id", data.deal_id);
    }
  } else if (["refund.created", "refund.processed"].includes(event) && payload?.payload?.refund?.entity?.id) {
    const refund = payload.payload.refund.entity;
    const { data: row, error } = await db
      .from("sv_payments")
      .select("id,deal_id")
      .eq("provider_payment_id", refund.payment_id)
      .eq("provider", "razorpay")
      .maybeSingle();
    if (error) return json({ ok: false, error: "refund_lookup_failed" }, 500);
    if (row) {
      paymentRowId = row.id;
      await db.from("sv_payments").update({
        status: "refunded",
        provider_event_id: eventId,
        verified_at: new Date().toISOString(),
        raw_event_hash: payloadHash,
      }).eq("id", row.id);
      if (row.deal_id) {
        await db.from("sv_marketplace_deals").update({ payment_status: "refunded" }).eq("id", row.deal_id);
      }
    }
  }

  const { error: finalizeError } = await db
    .from("sv_payment_webhook_events")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
      payment_id: paymentRowId,
    })
    .eq("event_id", eventId);
  if (finalizeError) return json({ ok: false, error: "webhook_ledger_finalize_failed" }, 500);

  return json({ received: true, processed: true });
});
