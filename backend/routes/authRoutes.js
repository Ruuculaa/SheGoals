const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Registro
router.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const [existe] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existe.length > 0) return res.status(400).json({ msg: 'El email ya está registrado' });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashPassword]
    );

    const token = jwt.sign({ id: resultado.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, msg: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const usuario = usuarios[0];
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;