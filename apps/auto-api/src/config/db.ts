import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.ORACLE_DB_USER,
  password: process.env.ORACLE_DB_PASSWORD,
  connectString: process.env.ORACLE_DB_CONNECTION_STRING,
};

let poolReady = false;

export async function initializeDb() {
  if (!dbConfig.user || !dbConfig.password || !dbConfig.connectString) {
    throw new Error('Oracle database credentials are not configured. Refusing to start in mock mode.');
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
    poolReady = true;
    console.log('Oracle DB Connection Pool initialized');
  } catch (err) {
    console.error('Oracle DB initialization failed:', err);
    throw err;
  }
}

export async function getDbConnection() {
  if (!poolReady) throw new Error('Database pool is not initialized');
  return await oracledb.getConnection();
}

export async function executeQuery(sql: string, params: any = [], options: oracledb.ExecuteOptions = {}) {
  if (!poolReady) throw new Error('Database is not initialized');

  let connection;
  try {
    connection = await getDbConnection();
    return await connection.execute(sql, params, {
      ...options,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
