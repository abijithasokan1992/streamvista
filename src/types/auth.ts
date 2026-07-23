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

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface UserProfile extends User {
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  studioName?: string;
  website?: string;
  taxId?: string;
  bankAccount?: string;
}
