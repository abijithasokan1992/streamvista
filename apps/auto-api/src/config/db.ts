import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.ORACLE_DB_USER,
  password: process.env.ORACLE_DB_PASSWORD,
  connectString: process.env.ORACLE_DB_CONNECTION_STRING,
};

let isMock = false;

export async function initializeDb() {
  if (!dbConfig.user || !dbConfig.password || !dbConfig.connectString) {
    console.warn('Oracle DB credentials missing. Operating in ZERO-COST MOCK MODE.');
    isMock = true;
    return;
  }

  try {
    await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 2,
    });
    console.log('Oracle DB Connection Pool initialized');
  } catch (err) {
    console.error('Oracle DB initialization failed. Falling back to MOCK MODE:', err);
    isMock = true;
  }
}

export async function getDbConnection() {
  if (isMock) return null;
  return await oracledb.getConnection();
}

export async function executeQuery(sql: string, params: any = [], options: oracledb.ExecuteOptions = {}) {
  if (isMock) {
    console.log(`[MockDB] Executing: ${sql.substring(0, 100)}...`);
    // Return empty results to avoid breaking logic
    return { rows: [], outBinds: { productId: [Math.floor(Math.random() * 1000)] } };
  }

  let connection;
  try {
    connection = await getDbConnection();
    if (!connection) throw new Error('Could not get connection');
    const result = await connection.execute(sql, params, { ...options, outFormat: oracledb.OUT_FORMAT_OBJECT, autoCommit: true });
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}
