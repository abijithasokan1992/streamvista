const MAX_MESSAGES = 6;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 12000;
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_INSTRUCTION = `You are StreamVista AI, the public-facing assistant for StreamVista (OPC) Private Limited.
Help visitors understand StreamVista's media, content, licensing, distribution, studio-service and partnership workflows in clear language.
Do not claim access to private accounts, internal dashboards, founder/admin systems, unpublished titles, buyer lists, rights records, payments, contracts, approvals, credentials or confidential business data.
Never invent rights, availability, pricing, deal status, payment status, delivery status, legal clearance or partner approval.
Do not execute transactions or consequential business actions. Explain that authenticated workflows and human approval are required where appropriate.
If a question requires private account data or internal action, say that the user must sign in to the appropriate StreamVista workspace.`;

export function sanitizeMessages(value) {
  if (!Array.isArray(value)) return null;

  const messages = value
    .slice(-MAX_MESSAGES)
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content:
        typeof message.content === "string"
          ? message.content.trim().slice(0, MAX_MESSAGE_CHARS)
          : "",
    }))
    .filter((message) => message.content.length > 0);

  if (!messages.length) return null;

  let total = 0;
  const bounded = [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (total + message.content.length > MAX_TOTAL_CHARS) break;
    bounded.unshift(message);
    total += message.content.length;
  }

  return bounded.length ? bounded : null;
}

function toGeminiContents(messages) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function extractReply(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
}

function readGeminiApiKey() {
  try {
    // Resolve the production environment on every invocation so a recycled
    // serverless worker does not retain a stale module-level configuration snapshot.
    return typeof process?.env?.GEMINI_API_KEY === "string"
      ? process.env.GEMINI_API_KEY.trim()
      : "";
  } catch (error) {
    console.error(
      "Gemini configuration lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return "";
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (process.env.STREAMVISTA_PUBLIC_AI_ENABLED !== "true") {
    return response.status(503).json({ error: "StreamVista AI is not enabled for this environment." });
  }

  const apiKey = readGeminiApiKey();
  if (!apiKey) {
    return response.status(503).json({
      error: "StreamVista AI configuration is temporarily unavailable. Please retry shortly while the production environment recovers.",
    });
  }

  const messages = sanitizeMessages(request.body?.messages);
  if (!messages) {
    return response.status(400).json({ error: "A valid conversation is required." });
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: toGeminiContents(messages),
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: { maxOutputTokens: 1200 },
      }),
    });

    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.error("Gemini response error", upstream.status, payload?.error?.status || "unknown");
      const status = upstream.status === 429 ? 429 : 502;
      const message =
        upstream.status === 429
          ? "StreamVista AI quota is temporarily unavailable. Please try again later."
          : "StreamVista AI is temporarily unavailable.";
      return response.status(status).json({ error: message });
    }

    const reply = extractReply(payload);
    if (!reply) {
      return response.status(502).json({ error: "StreamVista AI returned an empty response." });
    }

    return response.status(200).json({ reply });
  } catch (error) {
    console.error(
      "StreamVista AI request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return response.status(502).json({ error: "StreamVista AI is temporarily unavailable." });
  }
}
