#!/usr/bin/env node
import readline from 'node:readline';

const PROJECT_ID = 'prj_9LRd7XDa1zJaGzADQd9uh7QtON6c';
const PROJECT_NAME = 'streamvista';
const TEAM_ID = 'team_RZTE8Xin6e0xeDOCwU2JXy4K';
const GITHUB_MAIN_API = 'https://api.github.com/repos/abijithasokan1992/streamvista/commits/main';
const EXPECTED_SUPABASE_PROJECT_REF = 'tqzimuwozhipqgyerdff';
const SUPABASE_URL = `https://${EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`;
const KEY_DISCOVERY_ORIGIN = 'https://streamvista-ai-chat.vercel.app';
const READY_URL = 'https://streamvista-black.vercel.app/api/ready';

const EXPECTED_READY = {
  status: 'ready',
  database: 'connected',
  project_ref: EXPECTED_SUPABASE_PROJECT_REF,
};

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is unavailable. No mutation was attempted.`);
  return value;
}
function getToken() { return requiredEnv('VERCEL_TOKEN'); }
function decodeJwtPayload(candidate) {
  const parts = candidate.split('.');
  if (parts.length !== 3) return null;
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch { return null; }
}
function validatedAnonKeyFromText(text) {
  const candidates = text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [];
  for (const candidate of new Set(candidates)) {
    const payload = decodeJwtPayload(candidate);
    if (payload?.ref === EXPECTED_SUPABASE_PROJECT_REF && payload?.role === 'anon') return candidate;
  }
  return null;
}
async function discoverPublishableKey() {
  const override = process.env.STREAMVISTA_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (override) {
    const payload = decodeJwtPayload(override);
    if (payload?.ref !== EXPECTED_SUPABASE_PROJECT_REF || payload?.role !== 'anon') throw new Error('Supabase publishable-key override failed canonical project/role validation. No mutation was attempted.');
    return override;
  }
  const homeResponse = await fetch(`${KEY_DISCOVERY_ORIGIN}/`, { redirect: 'follow' });
  if (!homeResponse.ok) throw new Error(`Could not read working StreamVista client shell (HTTP ${homeResponse.status}). No mutation was attempted.`);
  const html = await homeResponse.text();
  const inline = validatedAnonKeyFromText(html);
  if (inline) return inline;
  const assetPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)].map((match) => match[1]).slice(0, 12);
  if (assetPaths.length === 0) throw new Error('Working StreamVista client exposed no JavaScript bundle for publishable-key discovery. No mutation was attempted.');
  for (const assetPath of assetPaths) {
    const assetUrl = new URL(assetPath, KEY_DISCOVERY_ORIGIN).toString();
    const response = await fetch(assetUrl, { redirect: 'follow' });
    if (!response.ok) continue;
    const key = validatedAnonKeyFromText(await response.text());
    if (key) return key;
  }
  throw new Error('No canonical anon/publishable key was discoverable from the working StreamVista client. No mutation was attempted.');
}
async function vercelFetch(path, init = {}) {
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.error?.message || data?.message || `Vercel API ${response.status}`);
  return data;
}
function deploymentSha(deployment) { return deployment?.meta?.githubCommitSha || deployment?.gitSource?.sha || deployment?.source?.sha || ''; }
async function currentGitHubMainSha() {
  const response = await fetch(GITHUB_MAIN_API, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'streamvista-one-time-vercel-bootstrap' } });
  if (!response.ok) throw new Error(`Could not resolve current GitHub main (HTTP ${response.status}). No mutation was attempted.`);
  const data = await response.json();
  if (!data?.sha) throw new Error('GitHub main returned no commit SHA. No mutation was attempted.');
  return data.sha;
}
async function resolveCurrentProductionSource() {
  const mainSha = await currentGitHubMainSha();
  const data = await vercelFetch(`/v6/deployments?projectId=${PROJECT_ID}&target=production&limit=10&teamId=${TEAM_ID}`);
  const deployments = Array.isArray(data?.deployments) ? data.deployments : [];
  const source = deployments.find((deployment) => {
    const state = deployment?.readyState || deployment?.state || deployment?.status;
    const ref = deployment?.meta?.githubCommitRef;
    return deployment?.name === PROJECT_NAME && deployment?.target === 'production' && state === 'READY' && ref === 'main' && deploymentSha(deployment) === mainSha;
  });
  if (!source) throw new Error('Current Vercel production is not an exact READY deployment of current GitHub main. No mutation was attempted.');
  return { id: source.id || source.uid, sha: mainSha };
}
async function upsertEnv(publishableKey) {
  const body = [
    { key: 'VITE_SUPABASE_URL', value: SUPABASE_URL, type: 'plain', target: ['production', 'preview'], comment: 'Canonical StreamVista Supabase binding' },
    { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', value: publishableKey, type: 'encrypted', target: ['production', 'preview'], comment: 'Canonical StreamVista browser publishable key' },
  ];
  await vercelFetch(`/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}`, { method: 'POST', body: JSON.stringify(body) });
  return { written: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'], targets: ['production', 'preview'] };
}
async function redeployProductionSource(sourceId) {
  const created = await vercelFetch(`/v13/deployments?teamId=${TEAM_ID}`, { method: 'POST', body: JSON.stringify({ name: PROJECT_NAME, project: PROJECT_ID, deploymentId: sourceId, target: 'production' }) });
  const id = created?.id || created?.uid;
  if (!id) throw new Error('Vercel accepted redeploy request but returned no deployment ID.');
  return { id, url: created.url || null };
}
async function waitForDeployment(id, expectedSha, timeoutMs = 8 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const deployment = await vercelFetch(`/v13/deployments/${encodeURIComponent(id)}?teamId=${TEAM_ID}`);
    const state = deployment?.readyState || deployment?.status || deployment?.state;
    if (state === 'READY') {
      const sha = deploymentSha(deployment);
      if (sha && sha !== expectedSha) throw new Error('Redeployed production SHA does not match the verified current main SHA.');
      return { state, url: deployment.url || null };
    }
    if (['ERROR', 'CANCELED'].includes(state)) throw new Error(`Deployment ended in ${state}.`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error('Deployment did not reach READY before the verification timeout.');
}
async function waitForReadiness(timeoutMs = 3 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = null;
  while (Date.now() < deadline) {
    const response = await fetch(READY_URL, { redirect: 'follow', headers: { 'Cache-Control': 'no-cache' } });
    const body = await response.json().catch(() => null);
    lastStatus = response.status;
    const exact = response.status === 200 && body && Object.entries(EXPECTED_READY).every(([key, value]) => body[key] === value);
    if (exact) return { status: response.status, body };
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error(`Readiness gate did not reach the exact ready/connected contract (last HTTP ${lastStatus ?? 'unknown'}).`);
}
async function runBootstrap() {
  getToken();
  const source = await resolveCurrentProductionSource();
  const publishableKey = await discoverPublishableKey();
  const env = await upsertEnv(publishableKey);
  const redeploy = await redeployProductionSource(source.id);
  const deployment = await waitForDeployment(redeploy.id, source.sha);
  const readiness = await waitForReadiness();
  return { ok: true, project: PROJECT_NAME, source, env, redeploy: { id: redeploy.id, state: deployment.state, url: deployment.url || redeploy.url }, readiness, credentialsPersistedByBootstrap: false };
}
const TOOL = { name: 'bind_streamvista_env_and_redeploy', description: 'One-time StreamVista bootstrap: require existing Vercel authorization, prove current Vercel production is the exact READY deployment of current GitHub main, validate the canonical browser publishable key, upsert Supabase Vite variables into Production+Preview, redeploy current production, and verify /api/ready.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } };
function send(message) { process.stdout.write(`${JSON.stringify(message)}\n`); }
function resultText(value) { return [{ type: 'text', text: JSON.stringify(value, null, 2) }]; }
async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  if (message.method === 'notifications/initialized') return;
  const id = message.id;
  try {
    if (message.method === 'initialize') { send({ jsonrpc: '2.0', id, result: { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'streamvista-one-time-vercel-bootstrap', version: '2.1.0' } } }); return; }
    if (message.method === 'tools/list') { send({ jsonrpc: '2.0', id, result: { tools: [TOOL] } }); return; }
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
  runBootstrap().then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
} else {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', async (line) => { if (!line.trim()) return; try { await handle(JSON.parse(line)); } catch {} });
}
