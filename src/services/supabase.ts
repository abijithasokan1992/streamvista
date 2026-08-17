import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const EXPECTED_SUPABASE_PROJECT_REF = "uakpqqardziifcwzvgfx";
const CANONICAL_SUPABASE_URL = `https://${EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`;
const configuredUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const configuredPublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

function getProjectRef(value?: string) {
  if (!value) return "";
  try {
    return new URL(value).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

export const SUPABASE_CONFIG_ERROR = !configuredUrl || !configuredPublishableKey
  ? "StreamVista backend is not configured for this deployment."
  : getProjectRef(configuredUrl) !== EXPECTED_SUPABASE_PROJECT_REF
    ? `StreamVista backend binding mismatch. Expected project ${EXPECTED_SUPABASE_PROJECT_REF}.`
    : null;

export const SUPABASE_URL =
  configuredUrl && getProjectRef(configuredUrl) === EXPECTED_SUPABASE_PROJECT_REF
    ? configuredUrl
    : CANONICAL_SUPABASE_URL;

/**
 * Keep the public shell renderable when a deployment is missing its browser
 * Supabase configuration. Previously an invalid placeholder key was passed to
 * createClient(), which throws during module initialization and leaves the app
 * as a completely blank page. Data/auth operations still fail closed through
 * assertSupabaseConfigured().
 */
const unconfiguredSupabase = new Proxy({} as SupabaseClient, {
  get() {
    throw new Error(SUPABASE_CONFIG_ERROR || "Supabase is not configured.");
  },
});

export const supabase: SupabaseClient = configuredUrl && configuredPublishableKey && !SUPABASE_CONFIG_ERROR
  ? createClient(SUPABASE_URL, configuredPublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : unconfiguredSupabase;

export function assertSupabaseConfigured() {
  if (SUPABASE_CONFIG_ERROR) throw new Error(SUPABASE_CONFIG_ERROR);
}
