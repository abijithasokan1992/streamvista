import { UserProfile } from "../../types/auth";

/**
 * Public signup roles for Final MVP.
 * - creator / buyer: standard free-path public signup
 * - investor: public interest path (pending verification)
 * - studio: paid plans only — no free workspace until plan active
 * Admin / QC / Legal / Finance remain invite-only (never public).
 */
export type PublicSignupRole = "creator" | "buyer" | "investor" | "studio";

/** Passwordless magic-link request (create or return). */
export type MagicLinkInput = {
  email: string;
  /** Required when creating a first-time profile intent */
  create?: boolean;
  displayName?: string;
  signupRole?: PublicSignupRole;
  organizationName?: string;
};

export type SignupInput = MagicLinkInput & {
  /** @deprecated password auth removed from public MVP — kept optional for adapters */
  password?: string;
  displayName: string;
  signupRole: PublicSignupRole;
};

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  /** Prefer magic link; password path may throw on public MVP */
  login(email: string, password?: string): Promise<UserProfile>;
  requestMagicLink(input: MagicLinkInput): Promise<{ sent: true }>;
  signup(input: SignupInput): Promise<{ user: UserProfile | null; confirmationRequired: boolean }>;
  logout(): Promise<void>;
  /** Complete session after user opens email link */
  exchangeMagicLinkSession(): Promise<UserProfile | null>;
}
