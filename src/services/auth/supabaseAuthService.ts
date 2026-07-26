import { AuthService } from "./auth.types";
import { UserProfile, UserRole } from "../../types/auth";
import { supabase, isSupabaseConfigured } from "../../integrations/supabase/client";

export class SupabaseAuthService implements AuthService {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const user = session.user;
    
    const { data: profile } = await supabase
      .from('user_profiles' as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const p = profile as any;

    return {
      uid: user.id,
      email: user.email || '',
      displayName: p?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'StreamVista User',
      role: (p?.role as UserRole) || 'creator_partner',
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: p?.updated_at || new Date().toISOString(),
    };
  }

  async login(email: string, password?: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });

    if (error) throw error;
    const user = data.user;

    const { data: profile } = await supabase
      .from('user_profiles' as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const p = profile as any;

    return {
      uid: user.id,
      email: user.email || email,
      displayName: p?.full_name || user.user_metadata?.full_name || email.split('@')[0],
      role: (p?.role as UserRole) || 'creator_partner',
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: p?.updated_at || new Date().toISOString(),
    };
  }

  async register(email: string, password?: string, displayName?: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || '',
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Registration failed");

    await supabase.from('user_profiles' as any).upsert({
      user_id: user.id,
      email,
      full_name: displayName || email.split('@')[0],
      role: 'creator_partner',
    });

    return {
      uid: user.id,
      email: user.email || email,
      displayName: displayName || email.split('@')[0],
      role: 'creator_partner',
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async resetPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  }
}

export const supabaseAuthService = new SupabaseAuthService();
