const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Cuando alguien envíe datos (POST) a /register, ejecutamos la lógica de registro
router.post('/register', authController.registrarUsuario);
// Cuando alguien envíe datos a /login, ejecutamos la lógica de login
router.post('/login', authController.loginUsuario);

module.exports = router;