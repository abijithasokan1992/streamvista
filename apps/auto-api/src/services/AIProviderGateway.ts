type Provider = 'openai' | 'anthropic' | 'gemini';

export type AICapability =
  | 'chat'
  | 'logline'
  | 'synopsis'
  | 'script_optimizer'
  | 'shorts_script'
  | 'buyer_matchmaker';

export interface AIRequest {
  capability: AICapability;
  prompt: string;
  system?: string;
  provider?: Provider;
  model?: string;
  maxTokens?: number;
}

export interface AIResponse {
  provider: Provider;
  model: string;
  text: string;
  usage?: { inputTokens?: number; outputTokens?: number };
  providerRequestId?: string;
}

function secretFor(provider: Provider): string | undefined {
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY;
  return process.env.GEMINI_API_KEY;
}

function pickProvider(preferred?: Provider): Provider {
  if (preferred && secretFor(preferred)) return preferred;
  for (const provider of ['openai', 'anthropic', 'gemini'] as Provider[]) {
    if (secretFor(provider)) return provider;
  }
  throw Object.assign(new Error('No AI provider is configured'), { code: 'provider_not_configured' });
}

async function readJson(response: Response): Promise<any> {
  const text = await response.text();
  let payload: any;
  try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
  if (!response.ok) {
    const message = payload?.error?.message || payload?.error?.msg || `AI provider returned HTTP ${response.status}`;
    throw Object.assign(new Error(message), { code: 'provider_request_failed', statusCode: response.status });
  }
  return payload;
}

async function openAI(req: AIRequest, key: string): Promise<AIResponse> {
  const model = req.model || process.env.OPENAI_MODEL || 'gpt-5.1';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, input: [
      ...(req.system ? [{ role: 'system', content: [{ type: 'input_text', text: req.system }] }] : []),
      { role: 'user', content: [{ type: 'input_text', text: req.prompt }] },
    ], max_output_tokens: req.maxTokens || 1200 }),
  });
  const data = await readJson(response);
  return {
    provider: 'openai', model,
    text: String(data.output_text || '').trim(),
    usage: { inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens },
    providerRequestId: data.id,
  };
}

async function anthropic(req: AIRequest, key: string): Promise<AIResponse> {
  const model = req.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: req.maxTokens || 1200, system: req.system, messages: [{ role: 'user', content: req.prompt }] }),
  });
  const data = await readJson(response);
  const text = Array.isArray(data.content) ? data.content.filter((x: any) => x?.type === 'text').map((x: any) => x.text).join('\n') : '';
  return {
    provider: 'anthropic', model,
    text: text.trim(),
    usage: { inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens },
    providerRequestId: data.id,
  };
}

async function gemini(req: AIRequest, key: string): Promise<AIResponse> {
  const model = req.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: req.system ? { parts: [{ text: req.system }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: req.prompt }] }],
      generationConfig: { maxOutputTokens: req.maxTokens || 1200 },
    }),
  });
  const data = await readJson(response);
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
  return {
    provider: 'gemini', model,
    text: text.trim(),
    usage: { inputTokens: data.usageMetadata?.promptTokenCount, outputTokens: data.usageMetadata?.candidatesTokenCount },
    providerRequestId: data.responseId,
  };
}

export async function runAI(request: AIRequest): Promise<AIResponse> {
  const provider = pickProvider(request.provider);
  const key = secretFor(provider);
  if (!key) throw Object.assign(new Error(`AI provider ${provider} is not configured`), { code: 'provider_not_configured' });
  if (provider === 'openai') return openAI(request, key);
  if (provider === 'anthropic') return anthropic(request, key);
  return gemini(request, key);
}
