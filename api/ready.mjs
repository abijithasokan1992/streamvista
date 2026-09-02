import { serviceClient } from "./payment/_shared.mjs";

export default async function handler(_request, response) {
  try {
    const client = serviceClient();
    const checks = {};
    const { error: profileError } = await client.from("sv_app_profiles").select("id").limit(1);
    checks.database = !profileError;
    checks.supabase = true;
    if (profileError) throw profileError;
    return response.status(200).json({ status: "ready", service: "streamvista", checks, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Readiness check failed", error instanceof Error ? error.message : "unknown");
    return response.status(503).json({ status: "not_ready", service: "streamvista", checks: { database: false, supabase: false }, timestamp: new Date().toISOString() });
  }
}
