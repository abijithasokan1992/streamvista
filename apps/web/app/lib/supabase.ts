import { createClient, type Session } from '@supabase/supabase-js';

// Canonical production Auth/data plane. Never point the browser client at a retired Bridge project.
const CANONICAL_SUPABASE_PROJECT_REF = 'uakpqqardziifcwzvgfx';
const CANONICAL_SUPABASE_URL = `https://${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`;
const configuredPublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
) as string | undefined;

export const SUPABASE_URL = CANONICAL_SUPABASE_URL;
export const SUPABASE_CONFIG_ERROR = !configuredPublishableKey
  ? 'Authentication is not configured for this deployment.'
  : null;

if (!configuredPublishableKey) {
  console.warn('[StreamVista] Supabase Auth is not configured. Set VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = configuredPublishableKey
  ? createClient(SUPABASE_URL, configuredPublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Return a usable session for API/payment calls. A locally cached access token can
 * be stale while the refresh-token flow is still pending, so explicitly refresh
 * when the cached session is missing/near expiry. This keeps every product surface
 * on the same canonical Supabase Auth session.
 */
export async function getFreshSession(): Promise<Session | null> {
  if (!supabase) return null;

  const { data: current } = await supabase.auth.getSession();
  const session = current.session;
  const expiresAt = Number(session?.expires_at || 0);
  const expiresSoon = expiresAt > 0 && expiresAt * 1000 <= Date.now() + 60_000;

  if (session?.access_token && !expiresSoon) return session;

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error || !refreshed.session?.access_token) return null;
  return refreshed.session;
}
