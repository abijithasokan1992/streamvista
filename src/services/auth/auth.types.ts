import { UserProfile } from "../../types/auth";

/**
 * Public signup roles for Final MVP.
 * - creator / buyer: standard free-path public signup
 * - investor: public interest path (pending verification)
 * - studio: paid plans only — no free workspace until plan active
 * Admin / QC / Legal / Finance remain invite-only (never public).
 */
export type PublicSignupRole = "creator" | "buyer" | "investor" | "studio";

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
