const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../../db');

// LOGIN - dengan error handling lebih baik
const loginHandler = async (request, h) => {
  try {
    const { email, password } = request.payload;

    // Validasi input
    if (!email || !password) {
      return h.response({ 
        message: 'Email dan password harus diisi' 
      }).code(400);
    }

    const result = await pool.query(
      'SELECT user_id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return h.response({ 
        message: 'Email atau password salah.' 
      }).code(401);
    }

    const user = result.rows[0];
    
    // Pastikan password_hash ada
    if (!user.password_hash) {
      console.error('Password hash tidak ditemukan untuk user:', email);
      return h.response({ 
        message: 'Terjadi kesalahan. Silakan hubungi admin.' 
      }).code(500);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return h.response({ 
        message: 'Email atau password salah.' 
      }).code(401);
    }

    // Sukses login
    return h.response({
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }).code(200);

  } catch (err) {
    console.error('Login error:', err);
    // Pastikan tetap return JSON bahkan saat error
    return h.response({ 
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
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
    return h.response({ 
      message: 'Gagal mengambil data user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
  }
};

//  CREATE USER 
const createUserHandler = async (request, h) => {
  try {
    const { name, email, role, password } = request.payload;

    if (!name || !email || !password) {
      return h.response({ message: 'Semua field wajib diisi' }).code(400);
    }

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
    return h.response({ 
      message: 'Gagal menambahkan user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
  }
};

// GET /api/users/:id
const getUserByIdHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }

    return h.response(result.rows[0]).code(200);
  } catch (err) {
    console.error('getUserByIdHandler error:', err);
    return h.response({ 
      message: 'Gagal mengambil data user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
  }
};

// PUT /api/users/:id
const updateUserHandler = async (request, h) => {
  try {
    const { id } = request.params;
    const { name, email, role, password } = request.payload;

    if (!name || !email || !role) {
      return h.response({ message: 'Nama, email, dan role wajib diisi' }).code(400);
    }

    // cek user ada
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [id]
    );

    if (existingUser.rowCount === 0) {
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }

    // cek email dipakai user lain
    const emailConflict = await pool.query(
      'SELECT user_id FROM users WHERE email = $1 AND user_id <> $2',
      [email, id]
    );

    if (emailConflict.rowCount > 0) {
      return h.response({ message: 'Email sudah digunakan oleh user lain' }).code(409);
    }

    // jika password diisi, update password
    if (password && password.length > 0) {
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(
        `UPDATE users
         SET name = $1, email = $2, role = $3, password_hash = $4
         WHERE user_id = $5`,
        [name, email, role, passwordHash, id]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET name = $1, email = $2, role = $3
         WHERE user_id = $4`,
        [name, email, role, id]
      );
    }

    // ambil data terbaru
    const updated = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [id]
    );

    return h.response(updated.rows[0]).code(200);

  } catch (err) {
    console.error('updateUserHandler error:', err);
    return h.response({ 
      message: 'Gagal memperbarui user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
  }
};

// DELETE /api/users/:id
const deleteUserHandler = async (request, h) => {
  try {
    const { id } = request.params;

    const res = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id', 
      [id]
    );

    if (res.rowCount === 0) {
      return h.response({ message: 'User tidak ditemukan' }).code(404);
    }

    return h.response({ message: 'User berhasil dihapus' }).code(200);
  } catch (err) {
    console.error('deleteUserHandler error:', err);
    return h.response({ 
      message: 'Gagal menghapus user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    }).code(500);
  }
};

module.exports = {
  loginHandler,
  getUsersHandler,
  createUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler
};
