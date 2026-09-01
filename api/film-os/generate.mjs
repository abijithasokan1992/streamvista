import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const CANONICAL_SUPABASE_PROJECT_REF = "tqzimuwozhipqgyerdff";

function json(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store").setHeader("Content-Type", "application/json; charset=utf-8");
  return res.json(body);
}

function getSupabase() {
  const url = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  const host = new URL(url).hostname;
  if (host !== `${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`) throw new Error("Supabase environment is not bound to the canonical project");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUser(client, req) {
  const header = String(req.headers.authorization || "");
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  return error || !data?.user ? null : data.user;
}

async function generateWithOpenAI(prompt) {
  const key = String(process.env.OPENAI_API_KEY || "").trim();
  if (!key) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_FILM_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: [{
            type: "input_text",
            text: "You are the StreamVista Film OS executive producer and script doctor. Given one film concept line, create concise structured development material. Do not invent real people, existing copyrighted story text, or production claims. Return only valid JSON with keys: logline, synopsis, treatment, themes, audience, characters, world, scene_order, beginning, conflict, interval, second_half, climax, next_action. scene_order must be an array of concise scene objectives. next_action must be a single clear production action."
          }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ],
      text: { format: { type: "json_object" } }
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || "OpenAI generation failed";
    throw new Error(detail);
  }

  const text = payload?.output_text;
  if (!text) throw new Error("OpenAI returned no structured output");
  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const client = getSupabase();
    const user = await getUser(client, req);
    if (!user) return json(res, 401, { error: "Authentication required" });

    const input = req.body && typeof req.body === "object" ? req.body : {};
    const projectId = String(input.projectId || "").trim();
    const concept = String(input.concept || input.oneLine || "").trim();
    if (!projectId || !concept) return json(res, 400, { error: "projectId and concept are required" });
    if (concept.length > 2000) return json(res, 400, { error: "Concept is too long" });

    const { data: project, error: projectError } = await client
      .from("film_projects")
      .select("id,organization_id,name,created_by,stage,approval_state")
      .eq("id", projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return json(res, 404, { error: "Project not found" });

    const { data: membership, error: membershipError } = await client
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) return json(res, 403, { error: "Project access denied" });

    const role = String(membership.role || "").toLowerCase();
    if (!["owner", "producer", "director", "writer"].includes(role)) {
      return json(res, 403, { error: "Development generation is restricted to production leadership" });
    }

    const generation = await generateWithOpenAI(concept);
    const fingerprint = crypto.createHash("sha256").update(JSON.stringify({ userId: user.id, projectId, concept, generation })).digest("hex");

    const { data: script, error: scriptError } = await client
      .from("scripts")
      .insert({ project_id: projectId, title: project.name, logline: generation.logline || concept, synopsis: generation.synopsis || null, approval_state: "ai_generated", created_by: user.id })
      .select("id,project_id,title,logline,synopsis,approval_state,created_by,created_at")
      .single();
    if (scriptError) throw scriptError;

    const { data: version, error: versionError } = await client
      .from("script_versions")
      .insert({ script_id: script.id, version: "v1", content: generation, approval_state: "ai_generated", created_by: user.id })
      .select("id,script_id,version,approval_state,created_by,created_at")
      .single();
    if (versionError) throw versionError;

    const { data: aiRun, error: aiRunError } = await client
      .from("ai_runs")
      .insert({ project_id: projectId, user_id: user.id, department: "development", agent: "Master AI Controller", provider: "openai", model: process.env.OPENAI_FILM_MODEL || "gpt-5-mini", instruction: concept, input_assets: [], usage: { fingerprint, purpose: "one_line_film_generation" }, cost: 0 })
      .select("id,project_id,user_id,department,agent,provider,model,instruction,usage,cost,created_at")
      .single();
    if (aiRunError) throw aiRunError;

    const { data: output, error: outputError } = await client
      .from("ai_outputs")
      .insert({ ai_run_id: aiRun.id, version: 1, output: { script_id: script.id, script_version_id: version.id, generation }, approval_state: "review" })
      .select("id,ai_run_id,version,approval_state,output,created_at")
      .single();
    if (outputError) throw outputError;

    const { error: updateError } = await client
      .from("film_projects")
      .update({ logline: generation.logline || concept, synopsis: generation.synopsis || null, stage: "development", approval_state: "review" })
      .eq("id", projectId);
    if (updateError) throw updateError;

    return json(res, 201, {
      success: true,
      project: { id: projectId, stage: "development", approval_state: "review" },
      script,
      scriptVersion: version,
      aiRun,
      aiOutput: output,
      nextAction: generation.next_action || "Review the generated development package",
    });
  } catch (error) {
    console.error("Film OS generation failed", error instanceof Error ? error.message : "unknown");
    return json(res, 503, { error: error instanceof Error ? error.message : "Film generation service is not available" });
  }
}
