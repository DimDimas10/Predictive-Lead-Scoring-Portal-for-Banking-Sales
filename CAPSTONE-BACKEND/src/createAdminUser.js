// scripts/createAdminUser.js
const bcrypt = require('bcrypt');
const pool = require('./db'); 

async function createAdmin() {
  const plainPassword = 'demo123';
  const hash = await bcrypt.hash(plainPassword, 10);

  await pool.query(
    `INSERT INTO users (user_id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)`,
    ['1', 'Andi Wijaya', 'sales@bank.com', hash, 'admin']
  );

  console.log('User admin dibuat.');
  await pool.end();
}

createAdmin().catch(console.error);
