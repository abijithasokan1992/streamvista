import type { UserRole } from "../types/auth";

export type Permission =
  | "platform.manage"
  | "founder.approve"
  | "admin.manage"
  | "titles.read"
  | "titles.write"
  | "drafts.write"
  | "uploads.write"
  | "screenings.manage"
  | "buyer.access"
  | "finance.manage"
  | "qc.manage"
  | "legal.manage"
  | "support.manage";

export const ROLE_DEFINITIONS: Record<UserRole, { label: string; use: string; permissions: Permission[] }> = {
  platform_owner: {
    label: "Platform Owner",
    use: "Platform-level control",
    permissions: ["platform.manage", "founder.approve", "admin.manage", "titles.read", "titles.write", "drafts.write", "uploads.write", "screenings.manage", "buyer.access", "finance.manage", "qc.manage", "legal.manage", "support.manage"],
  },
  founder: {
    label: "Founder",
    use: "Founder account / Founder permissions",
    permissions: ["founder.approve", "admin.manage", "titles.read", "titles.write", "drafts.write", "uploads.write", "screenings.manage", "buyer.access", "finance.manage", "qc.manage", "legal.manage", "support.manage"],
  },
  super_admin: {
    label: "Super Admin",
    use: "High-level administrative access",
    permissions: ["admin.manage", "titles.read", "titles.write", "drafts.write", "uploads.write", "screenings.manage", "buyer.access", "finance.manage", "qc.manage", "legal.manage", "support.manage"],
  },
  admin: {
    label: "Admin",
    use: "Operational administration",
    permissions: ["admin.manage", "titles.read", "titles.write", "drafts.write", "uploads.write", "screenings.manage", "buyer.access", "finance.manage", "qc.manage", "legal.manage", "support.manage"],
  },
  creator_partner: {
    label: "Creator Partner",
    use: "Creator-side workflow",
    permissions: ["titles.read", "titles.write", "drafts.write", "uploads.write"],
  },
  buyer: {
    label: "Buyer",
    use: "Buyer workflow",
    permissions: ["titles.read", "buyer.access", "screenings.manage"],
  },
  finance: {
    label: "Finance",
    use: "Finance/payment workflow",
    permissions: ["finance.manage", "titles.read"],
  },
  qc_staff: {
    label: "QC Staff",
    use: "Quality-control workflow",
    permissions: ["titles.read", "qc.manage"],
  },
  legal_staff: {
    label: "Legal Staff",
    use: "Legal workflow",
    permissions: ["titles.read", "legal.manage"],
  },
  support_staff: {
    label: "Support Staff",
    use: "Support workflow",
    permissions: ["titles.read", "support.manage"],
  },
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  return role ? ROLE_DEFINITIONS[role].permissions.includes(permission) : false;
}
