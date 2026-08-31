import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server configuration is missing');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class AuthService {
  static async signup(userData: any) {
    const email = String(userData?.email || '').trim().toLowerCase();
    const password = String(userData?.password || '');
    if (!email || !password) throw new Error('Email and password are required');

    const client = supabaseAdmin();
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: userData?.fullName || userData?.full_name || null,
      },
    });
    if (error || !data.user) throw new Error(error?.message || 'Unable to create user');
    return data.user.id;
  }

  static async login(email: string, password: string) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error('Email and password are required');

    const client = supabaseAdmin();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error || !data.user || !data.session) throw new Error(error?.message || 'Invalid credentials');

    const { data: profile, error: profileError } = await client
      .from('sv_app_profiles')
      .select('id,email,app_role,is_active')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: String(profile?.email || data.user.email || normalizedEmail),
        username: data.user.user_metadata?.username || null,
        fullName: data.user.user_metadata?.full_name || null,
        role: profile?.app_role || null,
      },
    };
  }

  static async getUserPermissions(userId: string) {
    if (!userId) throw new Error('User id is required');
    const client = supabaseAdmin();
    const { data, error } = await client
      .from('sv_app_profiles')
      .select('app_role')
      .eq('id', userId)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const role = String(data?.app_role || '');
    const permissionsByRole: Record<string, string[]> = {
      platform_owner: ['*'],
      founder: ['*'],
      super_admin: ['*'],
      admin: ['manage_users', 'manage_projects', 'manage_titles', 'manage_payments', 'view_audit'],
      finance: ['view_payments', 'view_revenue'],
      legal: ['manage_rights'],
      qc: ['run_qc', 'view_assets'],
      support: ['view_users', 'view_projects'],
      creator: ['manage_own_projects', 'upload_assets'],
      buyer: ['view_catalog', 'manage_deals'],
      viewer: [],
    };
    return permissionsByRole[role] || [];
  }
}
