import { supabaseAuthService } from "./supabaseAuthService";
import { firebaseAuthService } from "./firebaseAuthService";
import { isSupabaseConfigured } from "../../integrations/supabase/client";
import { AuthService } from "./auth.types";

export const authService: AuthService = {
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      const user = await supabaseAuthService.getCurrentUser();
      if (user) return user;
    }
    return firebaseAuthService.getCurrentUser();
  },
  async login(email: string, password?: string) {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.login(email, password);
    }
    return firebaseAuthService.login(email, password);
  },
  async register(email: string, password?: string, displayName?: string) {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.register(email, password, displayName);
    }
    return firebaseAuthService.register(email, password, displayName);
  },
  async resetPassword(email: string) {
    if (isSupabaseConfigured()) {
      return supabaseAuthService.resetPassword(email);
    }
    return firebaseAuthService.resetPassword(email);
  },
  async logout() {
    if (isSupabaseConfigured()) {
      await supabaseAuthService.logout();
    }
    return firebaseAuthService.logout();
  }
};

export type { AuthService } from "./auth.types";
