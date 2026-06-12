const mysql = require('mysql2');
require('dotenv').config();

// Creamos el grupo de conexiones con los datos del .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probamos si funciona la conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('🔗 ¡Conexión exitosa a la base de datos MySQL!');
        connection.release();
    }
});

module.exports = pool.promise();