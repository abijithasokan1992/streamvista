import { UserProfile, UserRole } from "../../types/auth";

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  login(email: string, password?: string): Promise<UserProfile>;
  logout(): Promise<void>;
  switchMockRole?(role: UserRole): Promise<UserProfile>;
}
