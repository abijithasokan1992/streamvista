import { json, payloadHash, readRawBody, serviceClient, verifyWebhookSignature } from "./_shared.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return json(response, 503, { error: "Payment webhook is not configured" });
  let client = null;
  let eventId = null;
  try {
    const rawBody = await readRawBody(request);
    const signature = request.headers["x-razorpay-signature"];
    if (!verifyWebhookSignature(secret, rawBody, signature)) return json(response, 401, { error: "Invalid webhook signature" });
    const payload = JSON.parse(rawBody);
    eventId = String(request.headers["x-razorpay-event-id"] || payload?.event_id || payload?.id || "").trim();
    const eventName = String(payload?.event || "").trim();
    if (!eventId || !eventName) return json(response, 400, { error: "Missing webhook event identity" });
    client = serviceClient();
    const hash = payloadHash(rawBody);
    const { data: existing, error: existingError } = await client.from("sv_payment_webhook_events").select("event_id,status").eq("event_id",eventId).maybeSingle();
    if (existingError) throw existingError;
    if (existing?.status === "processed") return json(response,200,{received:true,duplicate:true});
    const { error: eventInsertError } = await client.from("sv_payment_webhook_events").insert({ event_id:eventId,provider_event_id:eventId,event_name:eventName,payload_hash:hash,status:"received" });
    if (eventInsertError && eventInsertError.code !== "23505") throw eventInsertError;
    const payment = payload?.payload?.payment?.entity || null;
    const order = payload?.payload?.order?.entity || null;
    let paymentId = null;
    if (["payment.captured","payment.authorized","payment.failed"].includes(eventName) && payment?.id) {
      const nextStatus = eventName === "payment.captured" ? "captured" : eventName === "payment.authorized" ? "authorized" : "failed";
      const { data, error } = await client.from("sv_payments").update({ provider_payment_id:payment.id,provider_order_id:payment.order_id || undefined,provider_event_id:eventId,status:nextStatus,verified_at:new Date().toISOString(),raw_event_hash:hash }).eq("provider_order_id",payment.order_id).eq("provider","razorpay").select("id,deal_id").maybeSingle();
      if (error) throw error;
      paymentId = data?.id || null;
      if (data?.deal_id) await client.from("sv_marketplace_deals").update({ payment_status:nextStatus === "captured" ? "paid" : nextStatus }).eq("id",data.deal_id);
    } else if (eventName === "order.paid" && order?.id && payment?.id) {
      const { data, error } = await client.from("sv_payments").update({ provider_payment_id:payment.id,provider_event_id:eventId,status:"captured",verified_at:new Date().toISOString(),raw_event_hash:hash }).eq("provider_order_id",order.id).eq("provider","razorpay").select("id,deal_id").maybeSingle();
      if (error) throw error;
      paymentId = data?.id || null;
      if (data?.deal_id) await client.from("sv_marketplace_deals").update({ payment_status:"paid" }).eq("id",data.deal_id);
    } else if (["refund.processed","refund.created"].includes(eventName) && payload?.payload?.refund?.entity?.id) {
      const refund = payload.payload.refund.entity;
      const { data: row, error } = await client.from("sv_payments").select("id,deal_id").eq("provider_payment_id",refund.payment_id).eq("provider","razorpay").maybeSingle();
      if (error) throw error;
      if (row) {
        paymentId = row.id;
        await client.from("sv_payments").update({status:"refunded",provider_event_id:eventId,raw_event_hash:hash,verified_at:new Date().toISOString()}).eq("id",row.id);
        if (row.deal_id) await client.from("sv_marketplace_deals").update({payment_status:"refunded"}).eq("id",row.deal_id);
      }
    }
    const { error: updateError } = await client.from("sv_payment_webhook_events").update({status:"processed",processed_at:new Date().toISOString(),payment_id:paymentId}).eq("event_id",eventId);
    if (updateError) throw updateError;
    return json(response,200,{received:true,processed:true});
  } catch (error) {
    console.error("Razorpay webhook handler failed",error instanceof Error ? error.message : "unknown");
    if (client && eventId) await client.from("sv_payment_webhook_events").update({status:"failed"}).eq("event_id",eventId).catch(()=>{});
    return json(response,500,{error:"Webhook processing failed"});
  }
}
