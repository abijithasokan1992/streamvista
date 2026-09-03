import { createClient } from '@supabase/supabase-js';

const configuredUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const configuredAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
) as string | undefined;

const hasValidUrl = (() => {
  if (!configuredUrl) return false;
  try {
    const url = new URL(configuredUrl);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
})();

export const SUPABASE_URL = configuredUrl || '';
export const SUPABASE_CONFIG_ERROR = !hasValidUrl
  ? 'Authentication is not configured: VITE_SUPABASE_URL is missing or invalid.'
  : !configuredAnonKey
    ? 'Authentication is not configured: VITE_SUPABASE_ANON_KEY is missing.'
    : null;

if (SUPABASE_CONFIG_ERROR) {
  console.warn(`[StreamVista] ${SUPABASE_CONFIG_ERROR}`);
}

export const supabase = !SUPABASE_CONFIG_ERROR
  ? createClient(SUPABASE_URL, configuredAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
