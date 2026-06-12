const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Registro de Usuario
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) return res.status(400).json({ msg: 'El email ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // En Postgres usamos $1, $2, $3 y RETURNING id
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id',
      [nombre, email, hashPassword]
    );

    const token = jwt.sign({ id: nuevoUsuario.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, msg: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Login de Usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuario.rows.length === 0) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const esValido = await bcrypt.compare(password, usuario.rows[0].password);
    if (!esValido) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = jwt.sign({ id: usuario.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;