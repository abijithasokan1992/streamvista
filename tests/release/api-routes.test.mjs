import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import process from 'node:process';
import express from 'express';
import aiModule from '../../apps/auto-api/dist/routes/ai.js';
import paymentModule from '../../apps/auto-api/dist/routes/payments.js';

test('retained AI and payment routes reject invalid requests without provider calls', async (t) => {
  const keys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'];
  const previous = keys.map((key) => process.env[key]);
  keys.forEach((key) => { delete process.env[key]; });
  t.after(() => keys.forEach((key, index) => {
    if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index];
  }));
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiModule.default);
  app.use('/api/payments', paymentModule.default);
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['chat', 'logline', 'synopsis', 'script-optimizer', 'shorts-script', 'buyer-matchmaker']) {
    const response = await fetch(`${base}/api/ai/${route}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'test' }),
    });
    assert.equal(response.status, 503, route);
    assert.equal((await response.json()).error, 'provider_not_configured', route);
  }
  const invalid = await fetch(`${base}/api/ai/run`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ capability: 'unknown', prompt: 'test' }),
  });
  assert.equal(invalid.status, 400);
  for (const route of ['create-order', 'verify']) {
    const response = await fetch(`${base}/api/payments/${route}`, { method: 'POST' });
    assert.equal(response.status, 401, route);
  }
  assert.equal((await fetch(`${base}/api/payments/revenue`)).status, 401);
  assert.equal((await fetch(`${base}/api/payments/webhook`, { method: 'POST' })).status, 400);
});
