const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

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

// 📝 Crear objetivo (ACTUALIZADO CON PRIORIDAD)
router.post('/crear', auth, async (req, res) => {
  const { titulo, descripcion, categoria, fecha_inicio, fecha_fin, prioridad } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO objetivos (usuario_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin, prioridad) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.usuarioId, titulo, descripcion, categoria, fecha_inicio, fecha_fin, prioridad || 'Media']
    );
    res.json({ id: resultado.insertId, msg: 'Objetivo guardado' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear objetivo');
  }
});

// 🔍 Listar objetivos
router.get('/listar', auth, async (req, res) => {
  try {
    const [metas] = await pool.query('SELECT * FROM objetivos WHERE usuario_id = ? ORDER BY created_at DESC', [req.usuarioId]);
    res.json(metas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al listar objetivos');
  }
});

// ✏️ Editar objetivo (ACTUALIZADO CON PRIORIDAD)
router.put('/editar/:id', async (req, res) => {
  const { titulo, descripcion, categoria, fecha_inicio, fecha_fin, prioridad } = req.body;
  try {
    await pool.query(
      'UPDATE objetivos SET titulo = ?, descripcion = ?, categoria = ?, fecha_inicio = ?, fecha_fin = ?, prioridad = ? WHERE id = ?',
      [titulo, descripcion, categoria, fecha_inicio, fecha_fin, prioridad, req.params.id]
    );
    res.json({ msg: 'Meta actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar la meta');
  }
});

// 🗑️ Eliminar objetivo
router.delete('/eliminar/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM objetivos WHERE id = ? AND usuario_id = ?', [req.params.id, req.usuarioId]);
    res.json({ msg: 'Objetivo eliminado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar');
  }
});



module.exports = router;