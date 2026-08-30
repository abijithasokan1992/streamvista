const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openrouter/free';

export type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function generateWithOpenRouter(messages: OpenRouterMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const error = new Error('OpenRouter is not configured');
    (error as Error & { code?: string }).code = 'OPENROUTER_NOT_CONFIGURED';
    throw error;
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://streamvista.in',
        'X-Title': 'StreamVista',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null) as any;
    if (!response.ok) {
      const error = new Error(payload?.error?.message || 'OpenRouter request failed');
      (error as Error & { code?: string; status?: number }).code = 'OPENROUTER_REQUEST_FAILED';
      (error as Error & { code?: string; status?: number }).status = response.status;
      throw error;
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      const error = new Error('OpenRouter returned no assistant content');
      (error as Error & { code?: string }).code = 'OPENROUTER_EMPTY_RESPONSE';
      throw error;
    }

    return {
      content,
      model: payload?.model || model,
      usage: payload?.usage || null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
