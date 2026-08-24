import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://tqzimuwozhipqgyerdff.supabase.co").trim();

function json(res, status, value) {
  res.status(status).setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.json(value);
}

function bearerToken(req) {
  const value = String(req.headers.authorization || "");
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function entity(row, key) {
  return row?.raw_payload?.payload?.[key]?.entity || null;
}

function isoDay(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function dayRange(days) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start, end };
}

function isSuccess(eventName) {
  return eventName === "payment.captured" || eventName === "order.paid";
}

function isRefund(eventName) {
  return eventName === "refund.created" || eventName === "refund.processed";
}

function subscriptionEntity(row) {
  return entity(row, "subscription");
}

function subscriptionId(row) {
  const sub = subscriptionEntity(row);
  return String(sub?.id || row.provider_payment_id || row.provider_order_id || row.event_id || "");
}

function subscriptionAmount(row) {
  const sub = subscriptionEntity(row);
  return number(sub?.amount ?? sub?.plan_amount ?? row.amount);
}

function allocation(row, gross) {
  const raw = row?.raw_payload || {};
  const notes = raw?.payload?.payment?.entity?.notes || raw?.payload?.order?.entity?.notes || {};
  const creator = number(notes.creator_payout ?? notes.creatorPayout ?? notes.creator_payout_amount);
  const platform = number(notes.platform_collection ?? notes.platformCollection ?? notes.platform_fee ?? notes.platform_fee_amount);
  if (creator || platform) return { creatorPayout: creator, platformCollection: platform };
  return { creatorPayout: 0, platformCollection: 0, unallocated: gross };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!serviceRoleKey) return json(res, 503, { error: "Analytics backend is not configured" });

  const token = bearerToken(req);
  if (!token) return json(res, 401, { error: "Unauthenticated" });

  const admin = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json(res, 401, { error: "Unauthenticated" });

  // Never trust a role supplied by the browser. Authorization is resolved only
  // from the authenticated user's server-side profile record.
  const { data: profile, error: profileError } = await admin
    .from("sv_app_profiles")
    .select("id, app_role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) return json(res, 500, { error: "Unable to resolve authenticated profile" });
  if (!profile) return json(res, 403, { error: "Authenticated profile not found" });

  const adminRoles = new Set(["admin", "founder", "super_admin", "platform_owner"]);
  if (!adminRoles.has(String(profile.app_role))) return json(res, 403, { error: "Forbidden" });

  const { start } = dayRange(30);
  const { data: rows, error } = await admin
    .from("razorpay_webhook_ledger")
    .select("event_id,event_name,provider_payment_id,provider_order_id,amount,status,raw_payload,received_at,processed_at")
    .gte("received_at", start.toISOString())
    .order("received_at", { ascending: true })
    .limit(10000);

  if (error) {
    console.error("Payment analytics ledger query failed", error.message);
    return json(res, 500, { error: "Unable to load payment analytics" });
  }

  const safeRows = Array.isArray(rows) ? rows : [];
  const buckets = new Map();
  for (let i = 0; i < 30; i += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    buckets.set(isoDay(date), { date: isoDay(date), revenue: 0, refunds: 0, successfulPayments: 0 });
  }

  let grossRevenue = 0;
  let refundedAmount = 0;
  let successfulPayments = 0;
  let refundEvents = 0;
  let creatorPayout = 0;
  let platformCollection = 0;
  const activeSubscriptions = new Map();

  for (const row of safeRows) {
    const amount = number(row.amount);
    const date = isoDay(row.received_at);
    const bucket = buckets.get(date);
    const eventName = String(row.event_name || "");

    if (isSuccess(eventName)) {
      grossRevenue += amount;
      successfulPayments += 1;
      if (bucket) {
        bucket.revenue += amount;
        bucket.successfulPayments += 1;
      }
      const split = allocation(row, amount);
      creatorPayout += split.creatorPayout;
      platformCollection += split.platformCollection;
    }

    if (isRefund(eventName)) {
      refundedAmount += amount;
      refundEvents += 1;
      if (bucket) bucket.refunds += amount;
    }

    if (eventName.startsWith("subscription.")) {
      const sub = subscriptionEntity(row);
      const id = subscriptionId(row);
      const status = String(sub?.status || "").toLowerCase();
      if (id && ["active", "authenticated", "pending"].includes(status)) {
        activeSubscriptions.set(id, subscriptionAmount(row));
      }
      if (id && ["cancelled", "completed", "expired", "halted"].includes(status)) {
        activeSubscriptions.delete(id);
      }
    }
  }

  const monthlyRecurringRevenue = [...activeSubscriptions.values()].reduce((sum, amount) => sum + amount, 0);
  const successToRefundRatio = refundEvents === 0 ? (successfulPayments ? null : 0) : successfulPayments / refundEvents;
  const allocationTotal = creatorPayout + platformCollection;

  return json(res, 200, {
    ok: true,
    windowDays: 30,
    generatedAt: new Date().toISOString(),
    metrics: {
      grossRevenue,
      refundedAmount,
      netRevenue: grossRevenue - refundedAmount,
      activeSubscriptions: activeSubscriptions.size,
      monthlyRecurringRevenue,
      successfulPayments,
      refundEvents,
      successToRefundRatio,
      creatorPayout,
      platformCollection,
      allocationTotal,
    },
    series: [...buckets.values()],
    source: "public.razorpay_webhook_ledger",
  });
}
