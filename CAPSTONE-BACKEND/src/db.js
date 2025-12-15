// src/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'hopper.proxy.rlwy.net',  
  port: 56004,                 
  user: 'postgres',               
  password: 'GVadVDXDiPZYJUuwrXmbTbkIcyDCSEQw',
  database: 'railway',            
});

module.exports = pool;
