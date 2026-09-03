const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const marketplaceRouter = require('../../dist/routes/marketplace.js').default;
const qcRouter = require('../../dist/routes/qc.js').default;
const filmOsRouter = require('../../dist/routes/filmOs.js').default;
const webhooksRouter = require('../../dist/routes/webhooks.js').default;

function appWithUser(user) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = user;
    next();
  });
  app.use('/api/marketplace', marketplaceRouter);
  app.use('/api/qc', qcRouter);
  app.use('/api/film-os', filmOsRouter);
  app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);
  return app;
}

test('marketplace denies missing session', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/marketplace', marketplaceRouter);
  const response = await request(app).post('/api/marketplace/create-deal').send({ titleId: '3b4f7d88-f74c-4e7f-a7ec-6db70cdb2ad0' });
  assert.equal(response.status, 401);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'SESSION_REQUIRED');
});

test('marketplace denies non-buyer role', async () => {
  const app = appWithUser({ id: 'u1', role: 'creator' });
  const response = await request(app).post('/api/marketplace/create-deal').send({ titleId: '3b4f7d88-f74c-4e7f-a7ec-6db70cdb2ad0' });
  assert.equal(response.status, 403);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'ROLE_FORBIDDEN');
  assert.ok(response.body.requestId);
});

test('marketplace validates title id', async () => {
  const app = appWithUser({ id: 'u1', role: 'buyer' });
  const response = await request(app).post('/api/marketplace/create-deal').send({ titleId: 'bad-id' });
  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'INVALID_TITLE_ID');
  assert.ok(response.headers['content-type'].includes('application/json'));
});

test('marketplace returns safe 503 when env is missing', async () => {
  const app = appWithUser({ id: '9d451b89-376b-4dca-a753-2783da340fb5', role: 'buyer' });
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await request(app).post('/api/marketplace/create-deal').send({ titleId: '3b4f7d88-f74c-4e7f-a7ec-6db70cdb2ad0' });
  assert.equal(response.status, 503);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'DEAL_SERVICE_UNAVAILABLE');
});

test('qc trigger is feature-gated', async () => {
  const app = appWithUser({ id: 'u1', role: 'qc' });
  delete process.env.FEATURE_QC_TRIGGER_ENABLED;
  const response = await request(app).post('/api/qc/trigger').send({ titleId: '3b4f7d88-f74c-4e7f-a7ec-6db70cdb2ad0' });
  assert.equal(response.status, 503);
  assert.equal(response.body.error.code, 'FEATURE_DISABLED');
});

test('film-os write routes are feature-gated', async () => {
  const app = appWithUser({ id: 'u1', role: 'creator' });
  delete process.env.FEATURE_FILM_OS_WRITE_ENABLED;
  const response = await request(app).post('/api/film-os/create-project').send({ name: 'Project X' });
  assert.equal(response.status, 503);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'FEATURE_DISABLED');
});

test('webhook missing signature returns stable error json', async () => {
  const app = appWithUser({ id: 'u1', role: 'admin' });
  const response = await request(app).post('/api/webhooks/razorpay').send({ event: 'payment.captured' });
  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'SIGNATURE_REQUIRED');
});

test('webhook invalid signature returns stable error json', async () => {
  const app = appWithUser({ id: 'u1', role: 'admin' });
  const response = await request(app)
    .post('/api/webhooks/razorpay')
    .set('x-razorpay-signature', 'invalid-signature')
    .send({ id: 'evt_1', event: 'payment.captured' });
  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error.code, 'INVALID_SIGNATURE');
});
