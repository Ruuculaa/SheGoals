const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Middleware de autenticación básico
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = verificado.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};

// Crear Objetivo
router.post('/crear', auth, async (req, res) => {
  const { titulo, descripcion, categoria, fecha_inicio, fecha_fin } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO objetivos (usuario_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.usuarioId, titulo, descripcion, categoria, fecha_inicio, fecha_fin]
    );
    res.json({ id: resultado.rows[0].id, msg: 'Objetivo guardado' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear objetivo');
  }
});

// Listar Objetivos
router.get('/listar', auth, async (req, res) => {
  try {
    const metas = await pool.query('SELECT * FROM objetivos WHERE usuario_id = $1 ORDER BY created_at DESC', [req.usuarioId]);
    res.json(metas.rows); // En postgres los datos vienen en .rows
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al listar objetivos');
  }
});

// Eliminar Objetivo
router.delete('/eliminar/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM objetivos WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuarioId]);
    res.json({ msg: 'Objetivo eliminado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar');
  }
});

module.exports = router;