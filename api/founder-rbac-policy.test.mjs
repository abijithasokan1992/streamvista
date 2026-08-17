import test from "node:test";
import assert from "node:assert/strict";
import { evaluateFounderAuthorization } from "./founder-rbac-policy.mjs";

test("Founder is authorized only when server-derived DB role is founder", () => {
  assert.deepEqual(evaluateFounderAuthorization("founder"), {
    allowed: true,
    requiredRole: "founder",
    resolvedRole: "founder",
  });
});

test("Non-Founder server-derived roles are denied", () => {
  for (const role of ["platform_owner", "super_admin", "admin", "buyer", "creator_partner", "finance", "qc_staff", "legal_staff", "support_staff", null, undefined]) {
    assert.equal(evaluateFounderAuthorization(role).allowed, false, role);
  }
});

test("Client role claims cannot influence the policy", () => {
  // The policy accepts only the server-derived role. A caller claiming founder
  // through URL/body/header/client state therefore has no input path here.
  assert.equal(evaluateFounderAuthorization("admin").allowed, false);
  assert.equal(evaluateFounderAuthorization("buyer").allowed, false);
});
