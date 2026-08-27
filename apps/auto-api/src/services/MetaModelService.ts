const META_MODEL_BASE_URL = process.env.META_MODEL_BASE_URL || 'https://api.meta.ai/v1';
const META_MODEL_ID = process.env.META_MODEL_ID || 'muse-spark-1.2';

export type MuseInput = string | Array<Record<string, unknown>>;

export interface MuseOptions {
  input: MuseInput;
  model?: string;
  webSearch?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export class MetaModelService {
  static async responses(options: MuseOptions) {
    const apiKey = process.env.MODEL_API_KEY;
    if (!apiKey) {
      throw new Error('MODEL_API_KEY is not configured');
    }

    const body: Record<string, unknown> = {
      model: options.model || META_MODEL_ID,
      input: options.input,
    };

    if (options.webSearch) {
      body.tools = [{ type: 'web_search' }];
    }

    if (options.reasoningEffort) {
      body.reasoning = { effort: options.reasoningEffort };
    }

    const response = await fetch(`${META_MODEL_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Meta Model API ${response.status}: ${detail}`);
    }

    return response.json();
  }

  static async chat(input: string, options: Omit<MuseOptions, 'input'> = {}) {
    const result = await this.responses({ input, ...options });
    return {
      id: result.id,
      model: result.model,
      output_text: result.output_text || '',
      status: result.status,
      usage: result.usage,
    };
  }
}
