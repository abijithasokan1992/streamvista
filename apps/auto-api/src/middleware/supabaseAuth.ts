type AuthUser = { userId: string; email?: string; fullName?: string; workspace: string; role: string };

async function resolveSupabaseUser(token: string): Promise<AuthUser | null> {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: key },
  });
  if (!response.ok) return null;
  const authUser = await response.json() as { id: string; email?: string; user_metadata?: Record<string, string> };
  let profile: Record<string, string> = {};
  const profileResponse = await fetch(`${url}/rest/v1/sv_app_profiles?select=*&user_id=eq.${encodeURIComponent(authUser.id)}&limit=1`, {
    headers: { Authorization: `Bearer ${token}`, apikey: key },
  });
  if (profileResponse.ok) profile = ((await profileResponse.json()) as Record<string, string>[])[0] || {};
  return {
    userId: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email,
    workspace: profile.workspace || authUser.user_metadata?.workspace || 'creator-studio',
    role: profile.role || authUser.user_metadata?.role || 'creator',
  };
}

export function authorizeSupabase(roles: string[] = []) {
  return async (req: any, res: any, next: any) => {
    const token = String(req.headers.authorization || '').replace(/^Bearer\\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Access token missing' });
    try {
      const user = await resolveSupabaseUser(token);
      if (user) {
        if (roles.length > 0 && !roles.includes(user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
        req.user = user;
        return next();
      }
    } catch {
      // Authentication failures intentionally fail closed.
    }
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return res.status(401).json({ error: 'Invalid Supabase session' });
    }
    return res.status(403).json({ error: 'Invalid or expired token' });
  };
}
