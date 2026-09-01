import 'dotenv/config';
import { streamText } from 'ai';

const apiKey = process.env.AI_GATEWAY_API_KEY;

if (!apiKey) {
  throw new Error(
    'AI_GATEWAY_API_KEY is missing. Set it in tools/ai-gateway-runner/.env.local or the runtime environment.',
  );
}

async function main() {
  const result = streamText({
    model: 'openai/gpt-5.6-sol',
    prompt:
      'Respond with exactly one sentence confirming that the StreamVista AI Gateway text-generation path is operational.',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  process.stdout.write('\n');

  const usage = await result.usage;
  console.log('Token usage:', usage);
}

main().catch((error) => {
  console.error('AI Gateway verification failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
