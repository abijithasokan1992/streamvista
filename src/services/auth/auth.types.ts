import { UserProfile, UserRole } from "../../types/auth";

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  resetPassword(email: string): Promise<void>;
  login(email: string, password?: string): Promise<UserProfile>;
  register(email: string, password?: string, displayName?: string): Promise<UserProfile>;
  logout(): Promise<void>;
  switchMockRole?(role: UserRole): Promise<UserProfile>;
}
