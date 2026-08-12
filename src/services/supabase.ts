import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://ohumdxxhtgabpefrgsxr.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ruAIHadjsZvJbLkOp0kF7Q_nfMuFU4d";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
