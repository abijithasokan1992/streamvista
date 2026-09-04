import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const C = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-razorpay-event-id", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store" };
const J = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...C, "Content-Type": "application/json" } });
const S = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
const B = (v: string) => btoa(v).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

async function createOrder(amount: number, currency: string, receipt: string, notes: Record<string, string>) {
  const k = Deno.env.get("RAZORPAY_KEY_ID"), s = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!k || !s) throw Error("razorpay_credentials_missing");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${B(`${k}:${s}`)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });
  const t = await r.text();
  let d: any;
  try { d = JSON.parse(t); } catch { d = { raw: t }; }
  if (!r.ok) throw Error(typeof d?.error === "object" ? JSON.stringify(d.error) : `razorpay_http_${r.status}`);
  return d;
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: C });
  if (req.method !== "POST") return J({ ok: false, error: "method_not_allowed" }, 405);
  const ah = req.headers.get("authorization");
  if (!ah) return J({ ok: false, error: "authentication_required" }, 401);
  const token = ah.replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL"), service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return J({ ok: false, error: "supabase_service_unavailable" }, 503);
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return J({ ok: false, error: "invalid_token" }, 401);
  let p: any;
  try { p = await req.json(); } catch { return J({ ok: false, error: "invalid_json" }, 400); }

  let onboardingId = S(p.onboardingId ?? p.onboarding_id, 80);
  let createdOnboarding = false;
  let cycle = "";

  if (!onboardingId) {
    const ottPackage = S(p.ottPackage ?? p.package, 20).toLowerCase();
    const selectedCycle = ottPackage === "audit" ? "topup" : ottPackage === "launch" ? "creator" : "";
    if (!selectedCycle) return J({ ok: false, error: "ott_package_required" }, 422);
    const { data: created, error: ce } = await admin.from("onboarding_requests").insert({
      submitter_user_id: data.user.id,
      selected_cycle: selectedCycle,
      payment_status: "pending",
      onboarding_status: "pending_payment",
      amount_paise: 0,
      currency: "INR",
    }).select("id,submitter_user_id,selected_cycle,payment_status").single();
    if (ce || !created?.id) return J({ ok: false, error: "onboarding_create_failed" }, 500);
    onboardingId = String(created.id);
    cycle = selectedCycle;
    createdOnboarding = true;
  }

  const { data: o, error: oe } = await admin.from("onboarding_requests")
    .select("id,submitter_user_id,selected_cycle,payment_status")
    .eq("id", onboardingId).eq("submitter_user_id", data.user.id).maybeSingle();
  if (oe) return J({ ok: false, error: "onboarding_lookup_failed" }, 500);
  if (!o) return J({ ok: false, error: "onboarding_not_found" }, 404);
  if (o.payment_status !== "pending") return J({ ok: false, error: "payment_not_pending" }, 409);

  cycle = S(o.selected_cycle, 40).toLowerCase();
  const { data: pr, error: pe } = await admin.from("sales_pipeline_rules")
    .select("rule_value").eq("rule_key", "streamvista_ott_readiness_prices").maybeSingle();
  if (pe) return J({ ok: false, error: "price_rule_lookup_failed" }, 500);
  const rules = (pr?.rule_value ?? {}) as any;
  const priceKey = cycle === "topup" ? "audit" : cycle === "creator" ? "launch" : "";
  const amount = Number(rules[priceKey]);
  if (!priceKey || !Number.isInteger(amount) || amount < 100 || String(rules.currency ?? "INR").toUpperCase() !== "INR") return J({ ok: false, error: "unsupported_price" }, 422);

  try {
    const receipt = `sv_${onboardingId.replaceAll("-", "").slice(0, 24)}`;
    const order = await createOrder(amount, "INR", receipt, { user_id: data.user.id, onboarding_id: onboardingId, product: priceKey });
    const orderId = String(order.id ?? "");
    if (!orderId) return J({ ok: false, error: "razorpay_order_missing" }, 502);
    const { error: ue } = await admin.from("onboarding_requests").update({ razorpay_order_id: orderId, amount_paise: amount, currency: "INR", payment_status: "created", updated_at: new Date().toISOString() }).eq("id", onboardingId).eq("submitter_user_id", data.user.id);
    if (ue) return J({ ok: false, error: "payment_ledger_update_failed" }, 500);
    return J({ ok: true, orderId, keyId: Deno.env.get("RAZORPAY_KEY_ID"), amount, currency: "INR", receipt, userId: data.user.id, onboardingId, product: priceKey, createdOnboarding });
  } catch (e) {
    await admin.from("onboarding_requests").update({ payment_status: "failed", onboarding_status: "failed", updated_at: new Date().toISOString() }).eq("id", onboardingId).eq("submitter_user_id", data.user.id).eq("payment_status", "pending");
    console.error("create-razorpay-order", e);
    return J({ ok: false, error: e instanceof Error ? e.message : "razorpay_order_failed" }, 502);
  }
});
