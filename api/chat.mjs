const MAX_MESSAGES = 6;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 12000;

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_INSTRUCTION = `You are StreamVista AI, the public-facing assistant for StreamVista (OPC) Private Limited — a content licensing and distribution web app.
Help visitors understand media, content, licensing, distribution, studio-service and partnership workflows in clear, practical language.
Do not claim access to private accounts, internal dashboards, founder/admin systems, unpublished titles, buyer lists, rights records, payments, contracts, approvals, credentials or confidential business data.
Never invent rights, availability, pricing, deal status, payment status, delivery status, legal clearance or partner approval.
Do not execute transactions or consequential business actions. Explain that authenticated workflows and human approval are required where appropriate.
If a question requires private account data or internal action, say that the user must sign in to the appropriate StreamVista workspace.
Stay concise, modern, and media-industry fluent. You are guidance only — not a rights authority or deal desk.`;

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

function resolveProvider() {
  const explicit = (process.env.AI_PROVIDER || "").trim().toLowerCase();
  if (explicit === "groq" || explicit === "gemini") return explicit;
  if (process.env.GROQ_API_KEY?.trim() && !process.env.GEMINI_API_KEY?.trim()) return "groq";
  return "gemini";
}

function toGeminiContents(messages) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
}

function extractGeminiReply(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || null;
}

function extractGroqReply(payload) {
  const text = payload?.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

async function callGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { status: 503, error: "StreamVista AI is not configured (Gemini)." };
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

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
    return { status, error: message };
  }

  const reply = extractGeminiReply(payload);
  if (!reply) return { status: 502, error: "StreamVista AI returned an empty response." };
  return { status: 200, reply, provider: "gemini", model };
}

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return { status: 503, error: "StreamVista AI is not configured (Groq)." };
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 1200,
      messages: [{ role: "system", content: SYSTEM_INSTRUCTION }, ...messages],
    }),
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    console.error("Groq response error", upstream.status, payload?.error?.message || "unknown");
    const status = upstream.status === 429 ? 429 : 502;
    const message =
      upstream.status === 429
        ? "StreamVista AI quota is temporarily unavailable. Please try again later."
        : "StreamVista AI is temporarily unavailable.";
    return { status, error: message };
  }

  const reply = extractGroqReply(payload);
  if (!reply) return { status: 502, error: "StreamVista AI returned an empty response." };
  return { status: 200, reply, provider: "groq", model };
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

  const messages = sanitizeMessages(request.body?.messages);
  if (!messages) {
    return response.status(400).json({ error: "A valid conversation is required." });
  }

  const provider = resolveProvider();

  try {
    const result = provider === "groq" ? await callGroq(messages) : await callGemini(messages);

    if (result.error) {
      return response.status(result.status).json({ error: result.error });
    }

    return response.status(200).json({
      reply: result.reply,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error(
      "StreamVista AI request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return response.status(502).json({ error: "StreamVista AI is temporarily unavailable." });
  }
}
