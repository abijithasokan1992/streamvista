import { AuthService, MagicLinkInput, PublicSignupRole, SignupInput } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { assertSupabaseConfigured, supabase } from "../supabase";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  app_role: string;
  created_at: string;
  updated_at: string;
  verification_status?: string;
  organization_name?: string | null;
};

const ALLOWED_PUBLIC: PublicSignupRole[] = ["creator", "buyer", "investor", "studio"];

function normalizeRole(role: string): UserRole {
  switch (role) {
    case "founder":
      return "founder";
    case "super_admin":
      return "super_admin";
    case "admin":
      return "admin";
    case "buyer":
      return "buyer";
    case "finance":
      return "finance";
    case "qc":
    case "qc_staff":
      return "qc_staff";
    case "legal":
    case "legal_staff":
      return "legal_staff";
    case "operations":
    case "support_staff":
      return "support_staff";
    case "investor":
      return "creator_partner";
    case "studio":
      return "creator_partner";
    case "creator":
    case "creator_partner":
    case "licensing":
      return "creator_partner";
    default:
      return "support_staff";
  }
}

const mapProfile = (profile: ProfileRow): UserProfile => ({
  uid: profile.id,
  email: profile.email,
  displayName: profile.display_name,
  role: normalizeRole(profile.app_role),
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

async function getProfile() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.rpc("sv_session_profile");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Authenticated StreamVista profile was not found.");
  return mapProfile(data as ProfileRow);
}

function appOrigin() {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

function buildMetadata(input: {
  displayName?: string;
  signupRole?: PublicSignupRole;
  organizationName?: string;
}) {
  const metadata: Record<string, string> = {};
  if (input.displayName?.trim()) {
    metadata.full_name = input.displayName.trim();
    metadata.display_name = input.displayName.trim();
  }
  if (input.signupRole && ALLOWED_PUBLIC.includes(input.signupRole)) {
    metadata.signup_role = input.signupRole;
    metadata.plan_tier = input.signupRole === "studio" ? "paid_required" : "standard";
  }
  if (input.organizationName?.trim()) {
    metadata.organization_name = input.organizationName.trim();
  }
  return metadata;
}

class ApiAuthService implements AuthService {
  async getCurrentUser(): Promise<UserProfile | null> {
    assertSupabaseConfigured();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw new Error(error.message);
    return user ? getProfile() : null;
  }

  async login(email: string, _password?: string): Promise<UserProfile> {
    // Public MVP is magic-link only — use requestMagicLink from UI
    await this.requestMagicLink({ email, create: false });
    throw new Error("Magic link sent. Open the link in your email to continue — no password required.");
  }

  async requestMagicLink(input: MagicLinkInput): Promise<{ sent: true }> {
    assertSupabaseConfigured();
    const email = input.email.trim().toLowerCase();
    if (!email) throw new Error("Email is required");

    if (input.create) {
      if (!input.signupRole || !ALLOWED_PUBLIC.includes(input.signupRole)) {
        throw new Error("Select a valid account role.");
      }
      if (!input.displayName?.trim()) {
        throw new Error("Display name is required to create an account.");
      }
    }

    const emailRedirectTo = `${appOrigin()}/login?magic=1`;
    const data = input.create
      ? buildMetadata({
          displayName: input.displayName,
          signupRole: input.signupRole,
          organizationName: input.organizationName,
        })
      : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: input.create !== false,
        data,
      },
    });

    if (error) throw new Error(error.message);
    return { sent: true };
  }

  async signup(input: SignupInput) {
    await this.requestMagicLink({
      email: input.email,
      create: true,
      displayName: input.displayName,
      signupRole: input.signupRole,
      organizationName: input.organizationName,
    });
    return { user: null, confirmationRequired: true };
  }

  async exchangeMagicLinkSession(): Promise<UserProfile | null> {
    assertSupabaseConfigured();
    // Supabase JS picks up tokens from URL hash/query when detectSessionInUrl is default true
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!session?.user) return null;
    return getProfile();
  }

  async logout(): Promise<void> {
    assertSupabaseConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}

export const apiAuthService = new ApiAuthService();
