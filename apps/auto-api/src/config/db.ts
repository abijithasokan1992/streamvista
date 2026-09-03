import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { requiredEnv, requiredUrlEnv } from './env';

dotenv.config();

const resolvedSupabaseUrl: string = requiredUrlEnv('SUPABASE_URL');
const resolvedServiceRoleKey: string = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

let client: SupabaseClient | null = null;

export async function initializeDb(): Promise<void> {
  if (client) return;
  client = createClient(resolvedSupabaseUrl, resolvedServiceRoleKey, {
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
