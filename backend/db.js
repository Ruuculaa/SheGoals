const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Verificación rápida de conexión local
pool.getConnection()
  .then(conn => {
    console.log('🚀 ¡Conexión exitosa a tu MySQL local en el PC!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando al MySQL local:', err);
  });

module.exports = pool;