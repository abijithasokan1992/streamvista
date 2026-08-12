const MAX_MESSAGES = 6;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 12000;
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `You are StreamVista Founder OS, the protected AI operating assistant for StreamVista (OPC) Pvt Ltd.
Known workspace summary: Titles 21, Drafts 139, Screenings 34.
Help with titles, drafts, uploads, screenings, QC, legal, payments/revenue, analytics, campaigns, users, settings, creator/buyer/studio workspaces and rights-first media operations.
When the user clearly asks to open or show an app area, include exactly one navigation token in your response using this format: [NAVIGATE:/path]. Valid paths include /dashboard, /titles, /drafts, /uploads, /screenings, /qc, /legal, /finance, /analytics, /campaigns, /users, /settings, /workspace/creator, /workspace/buyer, /workspace/studio, /chat.
Example: user says "show titles" -> "Opening Titles. [NAVIGATE:/titles]"
Never invent rights, titles, deals, approvals, prices, payments, delivery status or legal clearance. Important business, rights, legal and financial actions require verified human approval.`;

export function sanitizeMessages(value) {
  if (!Array.isArray(value)) return null;

  const messages = value
    .slice(-MAX_MESSAGES)
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_CHARS) : "",
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

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return response.status(503).json({ error: "StreamVista AI is not configured." });
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
      const message = upstream.status === 429
        ? "StreamVista AI free-tier quota is temporarily exhausted. Please try again later."
        : "StreamVista AI is temporarily unavailable.";
      return response.status(status).json({ error: message });
    }

    const reply = extractReply(payload);
    if (!reply) {
      return response.status(502).json({ error: "StreamVista AI returned an empty response." });
    }

    return response.status(200).json({ reply });
  } catch (error) {
    console.error("StreamVista AI request failed", error instanceof Error ? error.message : "unknown error");
    return response.status(502).json({ error: "StreamVista AI is temporarily unavailable." });
  }
}
