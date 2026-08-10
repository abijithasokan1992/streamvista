import type { UserRole } from "../types/auth";

export type Permission =
  | "dashboard.read"
  | "users.read"
  | "users.manage"
  | "titles.read"
  | "titles.create"
  | "titles.update"
  | "titles.delete"
  | "finance.read"
  | "finance.write"
  | "qc.read"
  | "qc.write"
  | "legal.read"
  | "legal.write"
  | "support.read"
  | "support.write"
  | "agent.read"
  | "agent.execute"
  | "agent.approve"
  | "deployment.read"
  | "deployment.execute"
  | "audit.read";

const ALL: Permission[] = [
  "dashboard.read",
  "users.read",
  "users.manage",
  "titles.read",
  "titles.create",
  "titles.update",
  "titles.delete",
  "finance.read",
  "finance.write",
  "qc.read",
  "qc.write",
  "legal.read",
  "legal.write",
  "support.read",
  "support.write",
  "agent.read",
  "agent.execute",
  "agent.approve",
  "deployment.read",
  "deployment.execute",
  "audit.read",
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  platform_owner: ALL,
  founder: ALL,
  super_admin: ALL,
  admin: [
    "dashboard.read",
    "users.read",
    "titles.read",
    "titles.create",
    "titles.update",
    "qc.read",
    "qc.write",
    "legal.read",
    "support.read",
    "support.write",
    "agent.read",
    "deployment.read",
    "audit.read",
  ],
  creator_partner: ["dashboard.read", "titles.read", "titles.create", "titles.update"],
  buyer: ["dashboard.read", "titles.read"],
  finance: ["dashboard.read", "finance.read"],
  qc_staff: ["dashboard.read", "titles.read", "qc.read", "qc.write"],
  legal_staff: ["dashboard.read", "titles.read", "legal.read", "legal.write"],
  support_staff: ["dashboard.read", "users.read", "support.read", "support.write"],
};

export const HIGH_RISK_PERMISSIONS = new Set<Permission>([
  "users.manage",
  "titles.delete",
  "finance.write",
  "agent.execute",
  "deployment.execute",
]);

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requiresFounderApproval(permission: Permission): boolean {
  return HIGH_RISK_PERMISSIONS.has(permission);
}
