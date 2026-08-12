import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashPassword(password) {
  if (typeof password !== "string" || password.length < 12) throw new Error("Password must be at least 12 characters");
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password, encoded) {
  const [algorithm, salt, expected] = String(encoded).split(":");
  if (algorithm !== "scrypt" || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64), wanted = Buffer.from(expected, "hex");
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
export const newToken = () => randomBytes(32).toString("base64url");
