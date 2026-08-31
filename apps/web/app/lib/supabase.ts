import { createClient } from '@supabase/supabase-js';

const EXPECTED_SUPABASE_PROJECT_REF = 'tqzimuwozhipqgyerdff';
const CANONICAL_SUPABASE_URL = `https://${EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`;
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
