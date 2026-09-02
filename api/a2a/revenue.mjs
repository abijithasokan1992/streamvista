import { createHash } from "node:crypto";

const AGENTS = new Set([
  "revenue-orchestrator",
  "creator-acquisition",
  "rights-catalog",
  "buyer-match",
  "deal-desk",
  "payment",
  "follow-up",
]);

const APPROVAL_REQUIRED = new Set([
  "payment_capture",
  "refund",
  "role_change",
  "rights_approval",
  "deal_finalization",
  "external_creator_buyer_contact",
]);

function json(response, status, body) {
  response.status(status).setHeader("Cache-Control", "no-store").setHeader("Content-Type", "application/json; charset=utf-8");
  return response.json(body);
}

function envelopeHash(envelope) {
  return createHash("sha256").update(JSON.stringify(envelope)).digest("hex");
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "Method not allowed" });

  const body = request.body && typeof request.body === "object" ? request.body : {};
  const from = String(body.from_agent || "").trim();
  const to = String(body.to_agent || "").trim();
  const task = String(body.task || "").trim();
  const entityType = String(body.entity_type || "").trim();
  const entityId = String(body.entity_id || "").trim();
  const status = String(body.status || "proposed").trim();

  if (!AGENTS.has(from) || !AGENTS.has(to)) return json(response, 400, { error: "Unknown agent" });
  if (!task || !entityType || !entityId) return json(response, 400, { error: "task, entity_type and entity_id are required" });

  const requiresApproval = APPROVAL_REQUIRED.has(task) || body.requires_approval === true;
  const evidence = Array.isArray(body.evidence) ? body.evidence : [];
  const createdAt = new Date().toISOString();
  const envelope = {
    message_id: String(body.message_id || crypto.randomUUID()),
    from_agent: from,
    to_agent: to,
    task,
    entity_type: entityType,
    entity_id: entityId,
    status,
    evidence,
    requires_approval: requiresApproval,
    created_at: createdAt,
  };

  return json(response, 200, {
    accepted: true,
    dispatch: requiresApproval ? "approval_required" : "ready",
    envelope,
    envelope_hash: envelopeHash(envelope),
  });
}
