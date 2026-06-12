const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Requerido por Render para conexiones seguras SSL
  }
});

// Verificación rápida de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos de Render:', err);
  } else {
    console.log('🚀 ¡Conexión exitosa a la base de datos de Render en la nube!');
  }
});

module.exports = pool;