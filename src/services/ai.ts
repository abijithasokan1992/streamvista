export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessages(messages: AIMessage[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const payload = (await response.json().catch(() => null)) as { reply?: string; error?: string } | null;
  if (!response.ok || !payload?.reply) {
    throw new Error(payload?.error || "StreamVista AI could not answer right now.");
  }

  return payload.reply;
}
