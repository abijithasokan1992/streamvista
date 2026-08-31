import { createClient } from "@supabase/supabase-js";

const CANONICAL_SUPABASE_PROJECT_REF = "tqzimuwozhipqgyerdff";

function json(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store").setHeader("Content-Type", "application/json; charset=utf-8");
  return res.json(body);
}

function client() {
  const url = String(process.env.SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  if (new URL(url).hostname !== `${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`) throw new Error("Supabase environment is not bound to the canonical project");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function userFromRequest(sb, req) {
  const auth = String(req.headers.authorization || "");
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  const { data, error } = await sb.auth.getUser(token);
  return error || !data?.user ? null : data.user;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const sb = client();
    const user = await userFromRequest(sb, req);
    if (!user) return json(res, 401, { error: "Authentication required" });

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const name = String(body.name || body.title || "").trim();
    const oneLine = String(body.oneLine || body.logline || "").trim();
    if (!name) return json(res, 400, { error: "Project name is required" });
    if (name.length > 160 || oneLine.length > 2000) return json(res, 400, { error: "Project input is too long" });

    let { data: org, error: orgError } = await sb.from("organizations").select("id,name,owner_id").eq("owner_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (orgError) throw orgError;
    if (!org) {
      const created = await sb.from("organizations").insert({ name: `${user.email || "My"} Studio`, owner_id: user.id }).select("id,name,owner_id").single();
      if (created.error) throw created.error;
      org = created.data;
      const membership = await sb.from("memberships").insert({ organization_id: org.id, user_id: user.id, role: "owner" });
      if (membership.error) throw membership.error;
    }

    const { data: project, error: projectError } = await sb.from("film_projects").insert({ organization_id: org.id, name, logline: oneLine || null, created_by: user.id, stage: "development", approval_state: "draft" }).select("id,organization_id,name,logline,synopsis,stage,approval_state,created_by,created_at,updated_at").single();
    if (projectError) throw projectError;

    const { error: memberError } = await sb.from("project_members").insert({ project_id: project.id, user_id: user.id, role: "owner" });
    if (memberError) throw memberError;

    return json(res, 201, { success: true, project });
  } catch (error) {
    console.error("Film OS project creation failed", error instanceof Error ? error.message : "unknown");
    return json(res, 503, { error: "Project service is not available" });
  }
}
