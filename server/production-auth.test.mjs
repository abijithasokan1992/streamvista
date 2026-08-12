import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const productionAuthFiles = [
  "src/layouts/MainLayout.tsx",
  "src/contexts/AuthContext.tsx",
  "src/services/auth/auth.types.ts",
  "src/services/auth/index.ts",
];

test("production auth has no client-side role impersonation", async () => {
  const sources = await Promise.all(
    productionAuthFiles.map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
  );
  const productionAuthSource = sources.join("\n");

  assert.doesNotMatch(productionAuthSource, /RoleSwitcher/);
  assert.doesNotMatch(productionAuthSource, /switchMockRole/);
  assert.doesNotMatch(productionAuthSource, /mockAuthService/);
});

test("production auth is bound to the Supabase-backed adapter", async () => {
  const authIndex = await readFile(
    new URL("../src/services/auth/index.ts", import.meta.url),
    "utf8",
  );

  assert.match(authIndex, /apiAuthService/);
  assert.doesNotMatch(authIndex, /mock/i);
});
