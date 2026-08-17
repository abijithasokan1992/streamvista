import { createHmac, timingSafeEqual } from "node:crypto";

export function integerPaise(amountMajor) {
  const value = String(amountMajor ?? "").trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Invalid payment amount");
  const [whole, fraction = ""] = value.split(".");
  const paise = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  if (paise <= 0n || paise > 10_000_000_00n) throw new Error("Payment amount is outside the allowed range");
  return Number(paise);
}

export function safeCurrency(value) {
  const currency = String(value || "INR").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Invalid currency");
  return currency;
}

export function verifyWebhookSignature(secret, rawBody, receivedSignature) {
  if (!secret || !receivedSignature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(receivedSignature), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
