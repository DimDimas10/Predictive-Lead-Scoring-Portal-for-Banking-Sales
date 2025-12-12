// src/db.js
require('dotenv').config(); // Tambahkan ini biar aman saat dev local
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'yamabiko.proxy.rlwy.net',
  port: process.env.DB_PORT || 55668,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'BJzuwxrRAfUittZkDZzWLYABOisGhRUq',
  database: process.env.DB_NAME || 'railway',
  // TAMBAHKAN BAGIAN INI:
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
