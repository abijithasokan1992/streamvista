import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

let initialized = false;

export async function initializeDb() {
  if (initialized) return;
  const user = required('ORACLE_DB_USER');
  const password = required('ORACLE_DB_PASSWORD');
  const connectString = required('ORACLE_DB_CONNECTION_STRING');

  await oracledb.createPool({
    user,
    password,
    connectString,
    poolMax: 10,
    poolMin: 2,
    poolIncrement: 2,
  });
  initialized = true;
  console.log('Oracle DB connection pool initialized');
}

export async function getDbConnection() {
  if (!initialized) await initializeDb();
  return oracledb.getConnection();
}

export async function executeQuery(
  sql: string,
  params: any = [],
  options: oracledb.ExecuteOptions = {},
) {
  const connection = await getDbConnection();
  try {
    return await connection.execute(sql, params, {
      ...options,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
    });
  } finally {
    await connection.close();
  }
}
