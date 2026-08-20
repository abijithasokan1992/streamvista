import { AuthService, MagicLinkInput, PublicSignupRole, SignupInput } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { assertSupabaseConfigured, supabase } from "../supabase";
import { getAuthRedirect } from "../../config/appOrigin";

const ALLOWED_PUBLIC: PublicSignupRole[] = ["creator", "buyer", "investor", "studio"];

type SupabaseAuthUser = {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

function normalizeRole(role: unknown): UserRole {
  switch (role) {
    case "platform_owner": return "platform_owner";
    case "founder": return "founder";
    case "super_admin": return "super_admin";
    case "admin": return "admin";
    case "buyer": return "buyer";
    case "finance": return "finance";
    case "qc":
    case "qc_staff": return "qc_staff";
    case "legal":
    case "legal_staff": return "legal_staff";
    case "operations":
    case "support_staff": return "support_staff";
    case "investor":
    case "studio":
    case "creator":
    case "creator_partner":
    case "licensing": return "creator_partner";
    default: return "support_staff";
  }
}

function mapAuthUser(user: SupabaseAuthUser): UserProfile {
  const userMetadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};

  // Privileged roles must come from server-controlled app_metadata.
  const trustedAppRole = typeof appMetadata.role === "string"
    ? appMetadata.role
    : typeof appMetadata.app_role === "string"
      ? appMetadata.app_role
      : null;

  // Public signup metadata is restricted to non-admin roles.
  const signupRole = typeof userMetadata.signup_role === "string"
    ? userMetadata.signup_role
    : null;

  const role = trustedAppRole
    ? normalizeRole(trustedAppRole)
    : signupRole && ALLOWED_PUBLIC.includes(signupRole as PublicSignupRole)
      ? normalizeRole(signupRole)
      : "support_staff";

  const displayName = typeof userMetadata.display_name === "string"
    ? userMetadata.display_name
    : typeof userMetadata.full_name === "string"
      ? userMetadata.full_name
      : user.email?.split("@")[0] || "StreamVista User";

  return {
    uid: user.id,
    email: user.email || "",
    displayName,
    role,
    createdAt: user.created_at,
    updatedAt: user.updated_at || user.created_at,
  };
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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return user ? mapAuthUser(user as SupabaseAuthUser) : null;
  }

  async login(email: string, _password?: string): Promise<UserProfile> {
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

    const emailRedirectTo = getAuthRedirect();
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
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!session?.user) return null;
    return mapAuthUser(session.user as SupabaseAuthUser);
  }

  async logout(): Promise<void> {
    assertSupabaseConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}

export const apiAuthService = new ApiAuthService();
