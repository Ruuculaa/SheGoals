const express = require('express');
const router = express.Router();
const subtareaController = require('../controllers/subtareaController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas requieren que la usuaria esté logueada
router.get('/:objetivo_id', authMiddleware, subtareaController.listarSubtareas);
router.post('/crear', authMiddleware, subtareaController.crearSubtarea);
router.put('/alternar/:id', authMiddleware, subtareaController.alternarSubtarea);

module.exports = router;