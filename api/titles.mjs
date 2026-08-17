import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uakpqqardziifcwzvgfx.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const PRIVILEGED_ROLES = new Set(["admin", "founder", "super_admin", "platform_owner"]);

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").end(JSON.stringify(body));
}

function bearer(req) {
  const value = req.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" });
  if (!SUPABASE_KEY) return send(res, 503, { error: "backend_not_configured" });

  const token = bearer(req);
  if (!token) return send(res, 401, { error: "authentication_required" });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return send(res, 401, { error: "invalid_session" });

  const { data: profile, error: profileError } = await supabase
    .from("sv_app_profiles")
    .select("id,app_role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) return send(res, 403, { error: "authorization_unavailable" });
  if (!profile || !PRIVILEGED_ROLES.has(profile.app_role)) {
    return send(res, 403, { error: "forbidden" });
  }

  const { data, error } = await supabase
    .from("sv_app_titles")
    .select("id,creator_id,title,synopsis,content_type,primary_language,director,status,commercial_profile,metadata,created_at,updated_at");

  if (error) return send(res, 502, { error: "titles_unavailable" });
  return send(res, 200, { titles: data || [], role: profile.app_role });
}
