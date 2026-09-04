import { createClient, type Session } from '@supabase/supabase-js';

// Canonical production Auth/data plane. Never point the browser client at a retired Bridge project.
const CANONICAL_SUPABASE_PROJECT_REF = 'uakpqqardziifcwzvgfx';
const CANONICAL_SUPABASE_URL = `https://${CANONICAL_SUPABASE_PROJECT_REF}.supabase.co`;
// This is the project's public legacy anon key. It is intentionally browser-safe and
// remains constrained by Supabase Auth + RLS. Keeping the fallback canonical prevents
// a stale Vercel VITE_SUPABASE_* value from silently binding the browser to another project.
const CANONICAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha3BxcWFyZHppaWZjd3p2Z2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDY4MTAsImV4cCI6MjA2NjM4MjgxMH0.5on-OVA740CVGbI9xCjZQmeOZzhMsh2z45zJNjDqVuI';

export const SUPABASE_URL = CANONICAL_SUPABASE_URL;
export const SUPABASE_CONFIG_ERROR = null;

export const supabase = createClient(SUPABASE_URL, CANONICAL_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Return a usable session for API/payment calls. A locally cached access token can
 * be stale while the refresh-token flow is still pending, so explicitly refresh
 * when the cached session is missing/near expiry. This keeps every product surface
 * on the same canonical Supabase Auth session.
 */
export async function getFreshSession(): Promise<Session | null> {
  const { data: current } = await supabase.auth.getSession();
  const session = current.session;
  const expiresAt = Number(session?.expires_at || 0);
  const expiresSoon = expiresAt > 0 && expiresAt * 1000 <= Date.now() + 60_000;

  if (session?.access_token && !expiresSoon) return session;

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error || !refreshed.session?.access_token) return null;
  return refreshed.session;
}
