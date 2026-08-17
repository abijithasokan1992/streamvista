const EXPECTED_SUPABASE_PROJECT_REF = "uakpqqardziifcwzvgfx";
const CANONICAL_SUPABASE_URL = `https://${EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`;

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ status: "not_ready", reason: "method_not_allowed" });
  }

  const key = (
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  )?.trim();

  if (!key) {
    return response.status(503).json({
      status: "not_ready",
      database: "unconfigured",
    });
  }

  try {
    const result = await fetch(`${CANONICAL_SUPABASE_URL}/rest/v1/rpc/sv_app_readiness`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    const payload = await result.json().catch(() => null);
    const ready =
      result.ok &&
      payload &&
      typeof payload === "object" &&
      payload.database === "connected" &&
      payload.status === "ACTIVE_HEALTHY";

    if (!ready) {
      return response.status(503).json({
        status: "not_ready",
        database: "unavailable",
        project_ref: EXPECTED_SUPABASE_PROJECT_REF,
      });
    }

    return response.status(200).json({
      status: "ready",
      database: "connected",
      project_ref: EXPECTED_SUPABASE_PROJECT_REF,
    });
  } catch {
    return response.status(503).json({
      status: "not_ready",
      database: "unavailable",
      project_ref: EXPECTED_SUPABASE_PROJECT_REF,
    });
  }
}
