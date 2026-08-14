import { AuthService } from "./auth.types";
import { PublicSignupRole, UserProfile, UserRole, VerificationStatus } from "../../types/auth";
import { assertSupabaseConfigured, supabase } from "../supabase";

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  app_role: string;
  verification_status: VerificationStatus;
  organization_name?: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeRole(role: string): UserRole {
  switch (role) {
    case "founder": return "founder";
    case "super_admin": return "super_admin";
    case "admin": return "admin";
    case "buyer": return "buyer";
    case "finance": return "finance";
    case "qc": return "qc_staff";
    case "legal": return "legal_staff";
    case "operations":
    case "support": return "support_staff";
    case "creator":
    case "studio":
    case "licensing":
    case "investor":
      return "creator_partner";
    default:
      throw new Error("Unsupported StreamVista role. Access has been denied.");
  }
}

const mapProfile = (profile: ProfileRow): UserProfile => ({
  uid: profile.id,
  email: profile.email,
  displayName: profile.display_name,
  role: normalizeRole(profile.app_role),
  verificationStatus: profile.verification_status,
  organizationName: profile.organization_name || undefined,
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

  async login(email: string, password?: string): Promise<UserProfile> {
    assertSupabaseConfigured();
    if (!password) throw new Error("Password is required");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Invalid email or password");
    }

    return getProfile();
  }

  async signup(
    email: string,
    password: string,
    displayName: string,
    role: PublicSignupRole,
    organizationName?: string,
  ) {
    assertSupabaseConfigured();
    if (role !== "creator" && role !== "buyer") {
      throw new Error("Only Creator Partner and Buyer are available for public sign up.");
    }

    const emailRedirectTo =
      typeof window === "undefined"
        ? undefined
        : new URL("/login", window.location.origin).toString();
    const normalizedOrganization = organizationName?.trim() || undefined;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: displayName.trim(),
          display_name: displayName.trim(),
          signup_role: role,
          ...(role === "buyer" && normalizedOrganization
            ? { organization_name: normalizedOrganization }
            : {}),
        },
        emailRedirectTo,
      },
    });

    if (error) throw new Error(error.message);

    const confirmed = Boolean(data.session && data.user);
    return {
      user: confirmed && data.user ? await getProfile() : null,
      confirmationRequired: !confirmed,
    };
  }

  async logout(): Promise<void> {
    assertSupabaseConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}

export const apiAuthService = new ApiAuthService();
