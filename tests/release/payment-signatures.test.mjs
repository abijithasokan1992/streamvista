import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac, randomBytes } from 'node:crypto';
import process from 'node:process';
import { PaymentService } from '../../apps/auto-api/dist/services/PaymentService.js';

test('checkout verification rejects changed identifiers and malformed signatures', (t) => {
  const previous = process.env.RAZORPAY_KEY_SECRET;
  t.after(() => { if (previous === undefined) delete process.env.RAZORPAY_KEY_SECRET; else process.env.RAZORPAY_KEY_SECRET = previous; });
  const secret = randomBytes(32).toString('hex');
  process.env.RAZORPAY_KEY_SECRET = secret;
  const signature = createHmac('sha256', secret).update('order_test|pay_test').digest('hex');
  assert.equal(PaymentService.verifySignature('order_test', 'pay_test', signature), true);
  assert.equal(PaymentService.verifySignature('order_other', 'pay_test', signature), false);
  assert.equal(PaymentService.verifySignature('order_test', 'pay_other', signature), false);
  assert.equal(PaymentService.verifySignature('order_test', 'pay_test', 'short'), false);
  delete process.env.RAZORPAY_KEY_SECRET;
  assert.throws(() => PaymentService.verifySignature('order_test', 'pay_test', signature), /not configured/);
});

test('webhook verification uses the exact raw payload and fails without its secret', (t) => {
  const previous = process.env.RAZORPAY_WEBHOOK_SECRET;
  t.after(() => { if (previous === undefined) delete process.env.RAZORPAY_WEBHOOK_SECRET; else process.env.RAZORPAY_WEBHOOK_SECRET = previous; });
  const secret = randomBytes(32).toString('hex');
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
  const raw = '{"event":"payment.captured"}';
  const signature = createHmac('sha256', secret).update(raw).digest('hex');
  assert.equal(PaymentService.verifyWebhook(raw, signature), true);
  assert.equal(PaymentService.verifyWebhook(`${raw}\n`, signature), false);
  assert.equal(PaymentService.verifyWebhook(raw, 'short'), false);
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  assert.throws(() => PaymentService.verifyWebhook(raw, signature), /not configured/);
});
