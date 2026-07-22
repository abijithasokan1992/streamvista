import { AuthService } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";

const MOCK_USERS: Record<UserRole, UserProfile> = {
  platform_owner: { uid: "mock-po-1", email: "owner@streamvista.com", displayName: "Platform Owner", role: "platform_owner", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  founder: { uid: "mock-founder-1", email: "founder@streamvista.com", displayName: "Founder", role: "founder", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  super_admin: { uid: "mock-sa-1", email: "superadmin@streamvista.com", displayName: "Super Admin", role: "super_admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  admin: { uid: "mock-admin-1", email: "admin@streamvista.com", displayName: "Admin", role: "admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  creator_partner: { uid: "mock-creator-1", email: "creator@example.com", displayName: "Demo Creator", role: "creator_partner", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  buyer: { uid: "mock-buyer-1", email: "buyer@example.com", displayName: "Demo Buyer", role: "buyer", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  finance: { uid: "mock-finance-1", email: "finance@streamvista.com", displayName: "Finance Team", role: "finance", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  qc_staff: { uid: "mock-qc-1", email: "qc@streamvista.com", displayName: "QC Reviewer", role: "qc_staff", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  legal_staff: { uid: "mock-legal-1", email: "legal@streamvista.com", displayName: "Legal Staff", role: "legal_staff", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  support_staff: { uid: "mock-support-1", email: "support@streamvista.com", displayName: "Support Staff", role: "support_staff", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
};

class MockAuthService implements AuthService {
  private currentUser: UserProfile | null = null;
  private STORAGE_KEY = "streamvista_mock_user_role";

  constructor() {
    const savedRole = localStorage.getItem(this.STORAGE_KEY) as UserRole;
    if (savedRole && MOCK_USERS[savedRole]) {
      this.currentUser = MOCK_USERS[savedRole];
    } else {
      // Default to unauthenticated
      this.currentUser = null;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.currentUser;
  }

  async login(email: string, password?: string): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simple mock login: just find any mock user matching the email, or default to buyer
    const user = Object.values(MOCK_USERS).find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, user.role);
      return user;
    }
    
    // Default mock login fallback
    this.currentUser = MOCK_USERS.buyer;
    localStorage.setItem(this.STORAGE_KEY, "buyer");
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async switchMockRole(role: UserRole): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = MOCK_USERS[role];
    this.currentUser = user;
    localStorage.setItem(this.STORAGE_KEY, role);
    return user;
  }
}

export const mockAuthService = new MockAuthService();
