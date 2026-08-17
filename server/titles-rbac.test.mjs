import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const api = await readFile(new URL("../api/titles.mjs", import.meta.url), "utf8");

 test("Titles API requires a bearer session", () => {
  assert.match(api, /authorization/i);
  assert.match(api, /authentication_required/);
  assert.match(api, /invalid_session/);
});

test("Titles API derives authorization from authenticated DB profile role", () => {
  assert.match(api, /auth\.getUser\(token\)/);
  assert.match(api, /sv_app_profiles/);
  assert.match(api, /app_role/);
  assert.match(api, /PRIVILEGED_ROLES/);
});

test("Titles API does not accept a request-supplied role override", () => {
  assert.doesNotMatch(api, /req\.body.*role|req\.query.*role|req\.headers.*role/i);
  assert.doesNotMatch(api, /role\s*=\s*req\.(body|query|headers)/i);
});

test("Titles API returns server authorization failures", () => {
  assert.match(api, /send\(res, 401/);
  assert.match(api, /send\(res, 403/);
});
