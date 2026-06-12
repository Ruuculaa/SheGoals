const express = require('express');
const router = express.Router();
const objetivoController = require('../controllers/objetivoController');
const authMiddleware = require('../middleware/authMiddleware');

// Ponemos 'authMiddleware' justo antes del controlador para proteger la ruta
router.post('/crear', authMiddleware, objetivoController.crearObjetivo);
router.get('/listar', authMiddleware, objetivoController.obtenerObjetivos);
module.exports = router;
// Esta ruta también está protegida, solo usuarias logueadas pueden ver sus propios objetivos
// Ruta para eliminar (usamos .delete y pasamos el id como parámetro dinámico :id)
router.delete('/eliminar/:id', authMiddleware, objetivoController.eliminarObjetivo);