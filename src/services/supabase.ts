import { createClient } from "@supabase/supabase-js";

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

// A non-secret placeholder keeps the public shell renderable when a Preview deployment
// is missing its browser publishable key. All data/auth calls remain fail-closed through
// assertSupabaseConfigured().
export const SUPABASE_PUBLISHABLE_KEY = configuredPublishableKey || "streamvista-unconfigured";

export function assertSupabaseConfigured() {
  if (SUPABASE_CONFIG_ERROR) throw new Error(SUPABASE_CONFIG_ERROR);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
