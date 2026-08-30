import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { integerPaise, safeCurrency, verifyCheckoutSignature, verifyWebhookSignature } from "./_payment_crypto.mjs";

export const CANONICAL_SUPABASE_PROJECT_REF = "tqzimuwozhipqgyerdff";
export { integerPaise, safeCurrency, verifyCheckoutSignature, verifyWebhookSignature };

export function json(response, status, body, headers = {}) {
  response.status(status).setHeader("Cache-Control", "no-store").setHeader("Content-Type", "application/json; charset=utf-8");
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
  return response.json(body);
}

export function canonicalSupabaseUrl() {
  const value = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
  if (!value) throw new Error("SUPABASE_URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname !== `${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`) throw new Error("Supabase environment is not bound to the canonical project");
  return value.replace(/\/$/, "");
}

export function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(canonicalSupabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function authenticatedUser(client, request) {
  const header = String(request.headers.authorization || "");
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const { data, error } = await client.auth.getUser(token);
  return error || !data?.user ? null : data.user;
}

export function razorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) throw new Error("Razorpay server credentials are not configured");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export function payloadHash(rawBody) { return createHash("sha256").update(rawBody).digest("hex"); }

export async function readRawBody(request, limit = 1_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += Buffer.byteLength(chunk);
    if (size > limit) throw new Error("Payload too large");
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
