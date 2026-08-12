import { UserProfile } from "../../types/auth";

export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  login(email: string, password?: string): Promise<UserProfile>;
  signup(email: string, password: string, displayName: string): Promise<{ user: UserProfile | null; confirmationRequired: boolean }>;
  logout(): Promise<void>;
}
