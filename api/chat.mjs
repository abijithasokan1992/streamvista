const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 24000;

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

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const text = payload?.output
    ?.flatMap((item) => item?.content ?? [])
    ?.map((item) => item?.text)
    ?.filter((item) => typeof item === "string")
    ?.join("\n")
    ?.trim();

  return text || null;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return response.status(503).json({ error: "StreamVista AI is not configured." });
  }

  const messages = sanitizeMessages(request.body?.messages);
  if (!messages) {
    return response.status(400).json({ error: "A valid conversation is required." });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
        instructions:
          "You are StreamVista AI, the public conversational assistant for StreamVista. Be concise, practical and accurate. Help with content creation, licensing, distribution, studio services and partnerships. Never claim a deal, right, price, availability, approval or production action is confirmed unless the user supplied verified evidence. For legal, rights, commercial or financial commitments, clearly recommend human verification before action.",
        input: messages,
        max_output_tokens: 1200,
      }),
    });

    const payload = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.error("OpenAI response error", upstream.status, payload?.error?.type || "unknown");
      return response.status(502).json({ error: "StreamVista AI is temporarily unavailable." });
    }

    const reply = extractOutputText(payload);
    if (!reply) {
      return response.status(502).json({ error: "StreamVista AI returned an empty response." });
    }

    return response.status(200).json({ reply });
  } catch (error) {
    console.error("StreamVista AI request failed", error instanceof Error ? error.message : "unknown error");
    return response.status(502).json({ error: "StreamVista AI is temporarily unavailable." });
  }
}
