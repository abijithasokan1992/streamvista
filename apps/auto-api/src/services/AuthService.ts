import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'autoos_secret_key_2026';

export class AuthService {
  static async signup(userData: any) {
    const { email, password } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, email, password_hash)
      VALUES (:email, :email, :passwordHash)
      RETURNING user_id INTO :userId
    `;

    const result: any = await executeQuery(sql, {
      email,
      passwordHash,
      userId: { type: 2002, dir: 3003 } // oracledb.NUMBER, oracledb.BIND_OUT
    });

    return result.outBinds.userId[0];
  }

  static async login(email: string, password: string) {
    const sql = `SELECT * FROM users WHERE email = :email`;
    const result: any = await executeQuery(sql, { email });

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.USER_ID, email: user.EMAIL, username: user.USERNAME },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, user: { id: user.USER_ID, email: user.EMAIL, username: user.USERNAME, fullName: user.FULL_NAME } };
  }

  static async getUserPermissions(userId: number) {
    const sql = `
      SELECT p.permission_name
      FROM permissions p
      JOIN role_permissions rp ON p.permission_id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = :userId
    `;
    const result: any = await executeQuery(sql, { userId });
    return result.rows.map((row: any) => row.PERMISSION_NAME);
  }
}
