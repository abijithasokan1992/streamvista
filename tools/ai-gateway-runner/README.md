# StreamVista AI Gateway Runner

## Setup

1. Install Node.js dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local`.
3. Set `AI_GATEWAY_API_KEY` in `.env.local`. Never commit the real key.
4. Run:
   `npm start`

The runner uses the Vercel AI SDK `streamText` API with model `openai/gpt-5.6-sol`, streams the generated text to stdout, and prints returned token usage.

## Vercel CLI / agent setup

Install the Vercel CLI:
`npm i -g vercel`

For Claude Code, Codex, or Cursor:
`npx plugins add vercel/vercel-plugin`

For other agents:
`npx skills add vercel-labs/agent-skills`

These commands are intentionally documented here rather than executed from the GitHub connector because they require a local shell/runtime and, for the plugin installs, agent-specific environments.
