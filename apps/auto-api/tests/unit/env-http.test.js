const test = require('node:test');
const assert = require('node:assert/strict');

const { requiredEnv, requiredUrlEnv } = require('../../dist/config/env.js');
const { ensureRequestId } = require('../../dist/lib/http.js');

test('requiredEnv throws for missing variable', () => {
  delete process.env.TEST_REQUIRED_ENV;
  assert.throws(() => requiredEnv('TEST_REQUIRED_ENV'), /required/);
});

test('requiredUrlEnv rejects malformed url', () => {
  process.env.TEST_REQUIRED_URL = 'not-a-url';
  assert.throws(() => requiredUrlEnv('TEST_REQUIRED_URL'), /valid http/);
});

test('ensureRequestId reuses x-request-id header', () => {
  const req = { header: (name) => (name === 'x-request-id' ? 'req-123' : '') };
  assert.equal(ensureRequestId(req), 'req-123');
});
