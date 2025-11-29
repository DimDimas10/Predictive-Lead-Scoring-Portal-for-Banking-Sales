const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../../db');

// LOGIN
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const result = await pool.query(
      'SELECT user_id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return h.response({ message: 'Email atau password salah.' }).code(401);
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return h.response({ message: 'Email atau password salah.' }).code(401);
    }

    return h.response({
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }).code(200);

  } catch (err) {
    console.error('Login error:', err);
    return h.response({ message: 'Terjadi kesalahan server' }).code(500);
  }
};

//  GET USERS 
const getUsersHandler = async (request, h) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users ORDER BY name ASC'
    );
    return h.response(result.rows).code(200);
  } catch (err) {
    console.error('getUsersHandler error:', err);
    return h.response({ message: 'Gagal mengambil data user' }).code(500);
  }
};

//  CREATE USER 
const createUserHandler = async (request, h) => {
  const { name, email, role, password } = request.payload;

  if (!name || !email || !password) {
    return h.response({ message: 'Semua field wajib diisi' }).code(400);
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rowCount > 0) {
      return h.response({ message: 'Email sudah terdaftar' }).code(409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID(); 
    
    await pool.query(
      `INSERT INTO users (user_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, name, email, passwordHash, role]
    );

    return h.response({ message: 'User berhasil ditambahkan' }).code(201);

  } catch (err) {
    console.error('createUserHandler error:', err);
    return h.response({ message: 'Gagal menambahkan user' }).code(500);
  }
};

module.exports = {
  loginHandler,
  getUsersHandler,
  createUserHandler
};
