import { executeQuery, initializeDb } from '../apps/auto-api/src/config/db.js';

async function elevateAdmin() {
  const email = 'abijithasokan1992@gmail.com';
  
  try {
    await initializeDb();
    console.log(`Elevating admin for: ${email}`);

    // 1. Get user_id
    const userResult: any = await executeQuery('SELECT user_id FROM users WHERE email = :email', { email });
    if (userResult.rows.length === 0) {
      console.error('User not found. Please sign up first.');
      process.exit(1);
    }
    const userId = userResult.rows[0].USER_ID;

    // 2. Ensure role exists
    await executeQuery("INSERT INTO roles (role_name, description) VALUES ('Super Admin', 'Full system access')");
    
    // 3. Assign role
    await executeQuery(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT :userId, role_id FROM roles WHERE role_name = 'Super Admin'
    `, { userId });

    console.log('Successfully elevated to Super Admin.');
    process.exit(0);
  } catch (err) {
    console.error('Error elevating admin:', err);
    process.exit(1);
  }
}

elevateAdmin();
