#!/usr/bin/env node
import readline from 'node:readline';

const PROJECT_ID = 'prj_9LRd7XDa1zJaGzADQd9uh7QtON6c';
const PROJECT_NAME = 'streamvista';
const TEAM_ID = 'team_RZTE8Xin6e0xeDOCwU2JXy4K';
const SOURCE_DEPLOYMENT_ID = 'dpl_FHEHVCriUSuMstijrvMfzgnm3coW';
const EXPECTED_MAIN_SHA = '9ed1dca438dd0906ffd97bb1fade70cf92c2df7c';
const SUPABASE_URL = 'https://uakpqqardziifcwzvgfx.supabase.co';
const READY_URL = 'https://streamvista-black.vercel.app/api/ready';
const EXPECTED_READY = {
  status: 'ready',
  database: 'connected',
  project_ref: 'uakpqqardziifcwzvgfx',
};

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is unavailable. No mutation was attempted.`);
  return value;
}

function getToken() {
  return requiredEnv('VERCEL_TOKEN');
}

function getPublishableKey() {
  return requiredEnv('STREAMVISTA_SUPABASE_PUBLISHABLE_KEY');
}

async function vercelFetch(path, init = {}) {
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Vercel API ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function deploymentSha(deployment) {
  return deployment?.meta?.githubCommitSha || deployment?.gitSource?.sha || deployment?.source?.sha || '';
}

async function verifyLockedProductionSource() {
  const source = await vercelFetch(`/v13/deployments/${SOURCE_DEPLOYMENT_ID}?teamId=${TEAM_ID}`);
  const sha = deploymentSha(source);
  if (source?.projectId && source.projectId !== PROJECT_ID) {
    throw new Error('Locked source belongs to a different Vercel project. No mutation was attempted.');
  }
  if (source?.name !== PROJECT_NAME || source?.target !== 'production' || sha !== EXPECTED_MAIN_SHA) {
    throw new Error('Locked production source no longer matches canonical main. No mutation was attempted.');
  }
  return { id: source.id || source.uid || SOURCE_DEPLOYMENT_ID, sha };
}

async function upsertEnv() {
  const publishableKey = getPublishableKey();
  const body = [
    {
      key: 'VITE_SUPABASE_URL',
      value: SUPABASE_URL,
      type: 'plain',
      target: ['production', 'preview'],
      comment: 'Canonical StreamVista Supabase binding',
    },
    {
      key: 'VITE_SUPABASE_PUBLISHABLE_KEY',
      value: publishableKey,
      type: 'encrypted',
      target: ['production', 'preview'],
      comment: 'Canonical StreamVista browser publishable key',
    },
  ];
  await vercelFetch(`/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return {
    written: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
    targets: ['production', 'preview'],
  };
}

async function redeployLockedSource() {
  const created = await vercelFetch(`/v13/deployments?teamId=${TEAM_ID}`, {
    method: 'POST',
    body: JSON.stringify({
      name: PROJECT_NAME,
      project: PROJECT_ID,
      deploymentId: SOURCE_DEPLOYMENT_ID,
      target: 'production',
    }),
  });
  const id = created?.id || created?.uid;
  if (!id) throw new Error('Vercel accepted redeploy request but returned no deployment ID.');
  return { id, url: created.url || null };
}

async function waitForDeployment(id, timeoutMs = 8 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const deployment = await vercelFetch(`/v13/deployments/${encodeURIComponent(id)}?teamId=${TEAM_ID}`);
    const state = deployment?.readyState || deployment?.status || deployment?.state;
    if (state === 'READY') return { state, url: deployment.url || null };
    if (['ERROR', 'CANCELED'].includes(state)) throw new Error(`Deployment ended in ${state}.`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error('Deployment did not reach READY before the verification timeout.');
}

async function verifyReadiness() {
  const response = await fetch(READY_URL, { headers: { 'Cache-Control': 'no-cache' } });
  const body = await response.json().catch(() => null);
  const exact = response.status === 200 && body && Object.entries(EXPECTED_READY).every(([key, value]) => body[key] === value);
  if (!exact) throw new Error(`Readiness gate failed with HTTP ${response.status}.`);
  return { status: response.status, body };
}

async function runBootstrap() {
  getToken();
  getPublishableKey();
  const source = await verifyLockedProductionSource();
  const env = await upsertEnv();
  const redeploy = await redeployLockedSource();
  const deployment = await waitForDeployment(redeploy.id);
  const readiness = await verifyReadiness();
  return {
    ok: true,
    project: PROJECT_NAME,
    source,
    env,
    redeploy: { id: redeploy.id, state: deployment.state, url: deployment.url || redeploy.url },
    readiness,
    credentialsPersisted: false,
  };
}

const TOOL = {
  name: 'bind_streamvista_env_and_redeploy',
  description: 'One-time StreamVista bootstrap: verify locked production main source, upsert canonical Supabase Vite vars into Vercel Production+Preview, redeploy, and verify /api/ready. Requires VERCEL_TOKEN and STREAMVISTA_SUPABASE_PUBLISHABLE_KEY only in process environment.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

function send(message) { process.stdout.write(`${JSON.stringify(message)}\n`); }
function resultText(value) { return [{ type: 'text', text: JSON.stringify(value, null, 2) }]; }

async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  if (message.method === 'notifications/initialized') return;
  const id = message.id;
  try {
    if (message.method === 'initialize') {
      send({ jsonrpc: '2.0', id, result: { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'streamvista-one-time-vercel-bootstrap', version: '1.2.0' } } });
      return;
    }
    if (message.method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: [TOOL] } });
      return;
    }
    if (message.method === 'tools/call') {
      if (message.params?.name !== TOOL.name) throw new Error('Unknown tool');
      const result = await runBootstrap();
      send({ jsonrpc: '2.0', id, result: { content: resultText(result), isError: false } });
      return;
    }
    if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } });
  } catch (error) {
    if (id !== undefined) send({ jsonrpc: '2.0', id, result: { content: resultText({ ok: false, error: error instanceof Error ? error.message : String(error) }), isError: true } });
  }
}

if (process.argv.includes('--direct')) {
  runBootstrap()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
} else {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try { await handle(JSON.parse(line)); } catch { /* Keep one-time MCP server alive on invalid JSON. */ }
  });
}
