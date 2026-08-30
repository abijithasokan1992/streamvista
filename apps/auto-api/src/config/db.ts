import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Production backend must fail closed.');
}

let client: SupabaseClient | null = null;

export async function initializeDb(): Promise<void> {
  if (client) return;
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.from('sv_app_profiles').select('id', { head: true, count: 'exact' }).limit(1);
  if (error) throw new Error(`Supabase initialization failed: ${error.message}`);
}

export function getDbClient(): SupabaseClient {
  if (!client) throw new Error('Database not initialized');
  return client;
}

export async function executeQuery<T = unknown>(query: string): Promise<{ rows: T[] }> {
  throw new Error(`Raw SQL execution is intentionally disabled in the application API: ${query}`);
}
