import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
};

const authTypes = read("src/types/auth.ts");
const rbac = read("src/security/rbac.ts");
const agents = read("src/security/agentPermissions.ts");
const dmca = read("src/security/dmca.ts");
const audit = read("src/security/audit.ts");
const app = read("src/App.tsx");
const firestore = read("firestore.rules");

for (const role of ["platform_owner", "founder", "super_admin", "admin", "creator_partner", "buyer", "finance", "qc_staff", "legal_staff", "support_staff"]) {
  assert(authTypes.includes(`\"${role}\"`), `role registry contains ${role}`);
}

assert(rbac.includes("HIGH_RISK_PERMISSIONS"), "high-risk permission registry exists");
assert(rbac.includes("requiresFounderApproval"), "founder approval gate exists");
assert(agents.includes("requiresHumanApprovalForWrite: true"), "agent writes require human approval");
assert(app.includes("allowedRoles"), "route-level RBAC is enforced");
assert(app.includes("/finance") && app.includes("finance"), "finance route is role-scoped");
assert(app.includes("/users") && app.includes("PLATFORM.slice()"), "user administration is platform-scoped");

assert(firestore.includes("allow read, write: if false"), "Firestore defaults to deny-all");
assert(firestore.includes("match /auditLogs/{logId}"), "audit log collection is protected");
assert(firestore.includes("allow write: if false"), "sensitive server-only writes are denied to clients");

assert(dmca.includes("RightsEvidence"), "rights evidence contract exists");
assert(dmca.includes("DmcaCase"), "DMCA case contract exists");
assert(audit.includes("agent.approved"), "audit schema records human approval");
assert(audit.includes("approvedBy"), "audit event records approver identity");

if (process.exitCode) {
  console.error("Rule 77 production security gate FAILED");
  process.exit(process.exitCode);
}

console.log("Rule 77 production security gate PASSED");
