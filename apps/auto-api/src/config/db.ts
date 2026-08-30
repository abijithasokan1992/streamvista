/**
 * Legacy database compatibility boundary.
 *
 * The production command API is Supabase-backed. The old Oracle query layer is
 * intentionally disabled so legacy modules cannot silently fall back to mock
 * data or a second production database.
 */

export async function initializeDb(): Promise<void> {
  return;
}

export async function getDbConnection(): Promise<null> {
  return null;
}

export async function executeQuery<T = any>(
  _sql: string,
  _params: any = [],
  _options: any = {},
): Promise<T> {
  throw new Error('Legacy Oracle database adapter is disabled; use Supabase-backed services.');
}
