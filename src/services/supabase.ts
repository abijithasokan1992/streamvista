import { createClient } from "@supabase/supabase-js";

const VERIFIED_SUPABASE_URL = "https://ohumdxxhtgabpefrgsxr.supabase.co";
const VERIFIED_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ruAIHadjsZvJbLkOp0kF7Q_nfMuFU4d";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || VERIFIED_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || VERIFIED_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
