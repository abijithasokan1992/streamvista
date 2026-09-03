import { createClient } from '@supabase/supabase-js';
import { getDbClient } from '../config/db';
import { requiredEnv, requiredUrlEnv } from '../config/env';

function publicAuthClient() {
  return createClient(requiredUrlEnv('SUPABASE_URL'), requiredEnv('SUPABASE_ANON_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export class AuthService {
  static async signup(userData: { email?: string; password?: string; displayName?: string }) {
    const email = String(userData.email || '').trim().toLowerCase();
    const password = String(userData.password || '');
    const displayName = String(userData.displayName || '').trim();
    if (!email || !password) throw new Error('Email and password are required');
    if (password.length < 8) throw new Error('Password must contain at least 8 characters');

    const { data, error } = await getDbClient().auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { display_name: displayName },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('User creation returned no identity');
    return data.user.id;
  }

  static async login(emailInput: string, password: string) {
    const email = String(emailInput || '').trim().toLowerCase();
    if (!email || !password) throw new Error('Email and password are required');

    const { data, error } = await publicAuthClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session || !data.user) throw new Error('Authentication session was not created');

    const { data: profile, error: profileError } = await getDbClient()
      .from('sv_app_profiles')
      .select('id,email,app_role,verification_status')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: profile || {
        id: data.user.id,
        email: data.user.email || email,
        display_name: String(data.user.user_metadata?.display_name || ''),
      },
    };
  }

  static async getUserPermissions(userId: string) {
    const { data, error } = await getDbClient()
      .from('sv_app_profiles')
      .select('app_role')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.app_role ? [data.app_role] : [];
  }
}
