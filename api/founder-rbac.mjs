import { createClient } from "@supabase/supabase-js";
import { evaluateFounderAuthorization } from "./founder-rbac-policy.mjs";

const SUPABASE_URL = "https://uakpqqardziifcwzvgfx.supabase.co";

function json(res, status, value) {
  res.status(status).setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json; charset=utf-8");
  return res.json(value);
}

function bearerToken(req) {
  const value = String(req.headers.authorization || "");
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return {};
}

function clientRoleAttempted(req, body) {
  const queryRole = new URL(req.url, "http://localhost").searchParams.get("role");
  const headerRole = req.headers["x-role"] || req.headers["x-user-role"];
  const bodyRole = body && typeof body === "object" ? body.role : undefined;
  return Boolean(queryRole || headerRole || bodyRole);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return json(res, 503, { error: "RBAC verification backend is not configured" });

  const token = bearerToken(req);
  if (!token) {
    return json(res, 401, {
      error: "Unauthenticated",
      certification: { gate: "authentication", status: "denied" },
    });
  }

  const body = await readBody(req);
  const attempted = clientRoleAttempted(req, body);
  const admin = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) {
    return json(res, 401, {
      error: "Unauthenticated",
      certification: { gate: "authentication", status: "denied" },
    });
  }

  const { data: profile, error: profileError } = await admin
    .from("sv_app_profiles")
    .select("id, app_role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) return json(res, 500, { error: "Unable to resolve authenticated profile" });
  if (!profile) return json(res, 403, { error: "Authenticated profile not found" });

  // CRITICAL: app_role comes from the authenticated user's server-side DB profile.
  // req.body.role, ?role=founder, x-role, and client state are never used here.
  const authorization = evaluateFounderAuthorization(profile.app_role);
  const auditBase = {
    actor_id: authData.user.id,
    action: "founder.rbac.certification_probe",
    target: "/api/founder-rbac",
    resolved_role: profile.app_role,
    outcome: authorization.allowed ? "allowed" : "denied",
    client_role_attempted: attempted,
    metadata: {
      authenticated_user_id: authData.user.id,
      required_role: authorization.requiredRole,
      authorization_source: "sv_app_profiles.app_role",
      client_role_ignored: true,
    },
  };

  const { data: auditRow, error: auditError } = await admin
    .from("sv_rbac_audit_log")
    .insert(auditBase)
    .select("id, created_at")
    .single();

  if (auditError) return json(res, 500, { error: "Authorization audit write failed" });

  if (!authorization.allowed) {
    return json(res, 403, {
      error: "Forbidden",
      certification: {
        gate: "authorization",
        status: "denied",
        requiredRole: "founder",
        resolvedRole: authorization.resolvedRole,
        auditId: auditRow.id,
        clientRoleIgnored: true,
      },
    });
  }

  return json(res, 200, {
    ok: true,
    resource: "founder-rbac-certification-protected-resource",
    certification: {
      authentication: "authenticated",
      roleAuthority: "server-derived",
      resolvedRole: authorization.resolvedRole,
      authorization: "founder-allowed",
      positiveAccess: "granted",
      auditId: auditRow.id,
      clientRoleIgnored: true,
      tamperResistance: attempted ? "client-role-input-ignored" : "no-client-role-input",
    },
  });
}
