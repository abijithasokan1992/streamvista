import { UserProfile } from "../../types/auth";

/** Public signup only — never admin/qc/legal/finance */
export type PublicSignupRole = "creator" | "buyer";

export type SignupInput = {
  email: string;
  password: string;
  displayName: string;
  signupRole: PublicSignupRole;
  organizationName?: string;
};

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  login(email: string, password?: string): Promise<UserProfile>;
  signup(input: SignupInput): Promise<{ user: UserProfile | null; confirmationRequired: boolean }>;
  logout(): Promise<void>;
}
