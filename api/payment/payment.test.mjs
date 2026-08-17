import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { integerPaise, safeCurrency, verifyCheckoutSignature, verifyWebhookSignature } from "./_payment_crypto.mjs";

test("integerPaise converts rupees to exact paise without floating point", () => {
  assert.equal(integerPaise("100"), 10000);
  assert.equal(integerPaise("99.9"), 9990);
  assert.equal(integerPaise("0.01"), 1);
});

test("integerPaise rejects malformed or zero amounts", () => {
  assert.throws(() => integerPaise("0"));
  assert.throws(() => integerPaise("1.234"));
  assert.throws(() => integerPaise("abc"));
});

test("safeCurrency accepts ISO-4217 shaped currency codes", () => {
  assert.equal(safeCurrency("inr"), "INR");
  assert.throws(() => safeCurrency("IN"));
});

test("Razorpay checkout signature binds payment to the order", () => {
  const secret = "test-secret";
  const signature = createHmac("sha256", secret).update("order_123|pay_123").digest("hex");
  assert.equal(verifyCheckoutSignature(secret, "order_123", "pay_123", signature), true);
  assert.equal(verifyCheckoutSignature(secret, "order_999", "pay_123", signature), false);
});

test("Razorpay webhook signature uses HMAC SHA-256 and timing-safe comparison", () => {
  const secret = "test-secret";
  const body = '{"event":"payment.captured"}';
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyWebhookSignature(secret, body, signature), true);
  assert.equal(verifyWebhookSignature(secret, body, `${signature.slice(0, -1)}0`), false);
});
