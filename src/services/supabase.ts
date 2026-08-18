import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const EXPECTED_SUPABASE_PROJECT_REF = "tqzimuwozhipqgyerdff";
const CANONICAL_SUPABASE_URL = `https://${EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`;
const configuredPublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const SUPABASE_CONFIG_ERROR = !configuredPublishableKey
  ? "StreamVista backend is not configured for this deployment."
  : null;

// Production is pinned to the verified StreamVista Supabase project.
// The deployment URL variable is intentionally not trusted for project selection.
export const SUPABASE_URL = CANONICAL_SUPABASE_URL;

const unconfiguredSupabase = new Proxy({} as SupabaseClient, {
  get() {
    throw new Error(SUPABASE_CONFIG_ERROR || "Supabase is not configured.");
  },
});

export const supabase: SupabaseClient = configuredPublishableKey
  ? createClient(SUPABASE_URL, configuredPublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : unconfiguredSupabase;

export function assertSupabaseConfigured() {
  if (SUPABASE_CONFIG_ERROR) throw new Error(SUPABASE_CONFIG_ERROR);
}
