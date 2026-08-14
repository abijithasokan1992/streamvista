import { createClient } from "@supabase/supabase-js";

const EXPECTED_SUPABASE_PROJECT_REF = "uakpqqardziifcwzvgfx";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "StreamVista Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.",
  );
}

let configuredProjectRef = "";
try {
  configuredProjectRef = new URL(supabaseUrl).hostname.split(".")[0] || "";
} catch {
  throw new Error("StreamVista Supabase URL is invalid.");
}

if (configuredProjectRef !== EXPECTED_SUPABASE_PROJECT_REF) {
  throw new Error(
    `StreamVista Supabase binding mismatch. Expected project ${EXPECTED_SUPABASE_PROJECT_REF}.`,
  );
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_PUBLISHABLE_KEY = supabasePublishableKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
