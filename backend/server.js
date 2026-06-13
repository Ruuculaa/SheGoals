// Importamos la librería Express que instalamos antes
const express = require('express');
const cors = require('cors');
const app = express();
// Definimos el puerto donde escuchará el servidor (el 5000 es un clásico para backends)
const PORT = 5000;

// Configuramos el servidor para que entienda formato JSON
app.use(express.json());
app.use(cors());
// Creamos nuestra primera ruta de prueba (Ruta raíz)
app.get('/', (req, res) => {
    res.send('¡El backend de SheGoals está vivo y funcionando sin pagar un céntimo!');
});

// Le decimos al servidor que empiece a escuchar peticiones
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});

// Rutas de Autenticación
app.use('/api/usuarios', require('./routes/authRoutes'));
app.use('/api/objetivos', require('./routes/objetivoRoutes'));
app.use('/api/subtareas', require('./routes/subtareaRoutes'));