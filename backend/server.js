const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración abierta de CORS para evitar cualquier bloqueo local
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 📁 Tus rutas locales vinculadas a tus archivos reales
app.use('/api/usuarios', require('./routes/authRoutes'));
app.use('/api/objetivos', require('./routes/objetivoRoutes'));
app.use('/api/subtareas', require('./routes/subtareaRoutes'));

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});