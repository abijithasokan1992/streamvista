export type UserRole = 
  | "platform_owner"
  | "founder"
  | "super_admin"
  | "admin"
  | "creator_partner"
  | "buyer"
  | "finance"
  | "qc_staff"
  | "legal_staff"
  | "support_staff";

export type PublicSignupRole = "creator" | "buyer";
export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface UserProfile extends User {
  role: UserRole;
  verificationStatus?: VerificationStatus;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
}
