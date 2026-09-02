import { authenticatedUser, json, serviceClient } from "../payment/_shared.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" }, { Allow: "POST" });
  try {
    const client = serviceClient();
    const user = await authenticatedUser(client, request);
    if (!user) return json(response, 401, { error: "Unauthenticated" });

    const input = request.body && typeof request.body === "object" ? request.body : {};
    const titleId = String(input.titleId || "").trim();
    if (!titleId) return json(response, 400, { error: "titleId is required" });

    const { data: profile, error: profileError } = await client
      .from("sv_app_profiles")
      .select("id,app_role,verification_status")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile || profile.app_role !== "buyer" || !["verified", "approved"].includes(profile.verification_status)) {
      return json(response, 403, { error: "Verified buyer access is required" });
    }

    const { data: title, error: titleError } = await client
      .from("sv_app_titles")
      .select("id,org_id,creator_id,title,status,commercial_profile")
      .eq("id", titleId)
      .in("status", ["approved", "ready_for_distribution"])
      .maybeSingle();
    if (titleError) throw titleError;
    if (!title) return json(response, 404, { error: "Approved title not found" });

    const commercial = title.commercial_profile && typeof title.commercial_profile === "object" ? title.commercial_profile : {};
    const price = Number(commercial.price ?? commercial.license_price ?? 0);
    if (!Number.isFinite(price) || price <= 0) return json(response, 409, { error: "Title has no commercial license price" });

    const { data: existing, error: existingError } = await client
      .from("sv_marketplace_deals")
      .select("id,buyer_id,title_id,stage,contract_status,payment_status,offer_amount,currency,created_at")
      .eq("buyer_id", user.id)
      .eq("title_id", titleId)
      .in("payment_status", ["unpaid", "pending", "created"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return json(response, 200, { deal: existing, existing: true });

    const { data: deal, error: dealError } = await client
      .from("sv_marketplace_deals")
      .insert({
        org_id: title.org_id,
        product: "streamvista",
        buyer_id: user.id,
        title_id: title.id,
        stage: "payment_pending",
        offer_amount: price,
        currency: "INR",
        rights_scope: {},
        contract_status: "pending",
        payment_status: "unpaid",
      })
      .select("id,buyer_id,title_id,stage,contract_status,payment_status,offer_amount,currency,created_at")
      .single();
    if (dealError) throw dealError;

    return json(response, 201, { deal });
  } catch (error) {
    console.error("Crayons Bridge deal creation failed", error instanceof Error ? error.message : "unknown");
    return json(response, 503, { error: "Marketplace deal service is not available" });
  }
}