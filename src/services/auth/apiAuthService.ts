import { AuthService, SignupInput } from "./auth.types";
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
    case "creator":
    case "creator_partner":
    case "studio":
    case "licensing":
    case "investor":
      return "creator_partner";
    default:
      // Fail closed for unknown roles (Final MVP)
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

  async signup(input: SignupInput) {
    assertSupabaseConfigured();

    const signupRole = input.signupRole === "buyer" ? "buyer" : "creator";
    const emailRedirectTo =
      typeof window === "undefined"
        ? undefined
        : new URL("/login", window.location.origin).toString();

    const metadata: Record<string, string> = {
      full_name: input.displayName.trim(),
      display_name: input.displayName.trim(),
      // PR #43 trigger reads signup_role only — never trust client role/verification
      signup_role: signupRole,
    };

    if (signupRole === "buyer" && input.organizationName?.trim()) {
      metadata.organization_name = input.organizationName.trim();
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: metadata,
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
