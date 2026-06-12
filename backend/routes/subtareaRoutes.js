const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener subtareas de una meta
router.get('/:objetivo_id', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM subtareas WHERE objetivo_id = $1 ORDER BY id ASC', [req.params.objetivo_id]);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo subtareas');
  }
});

// Crear una subtarea nueva
router.post('/crear', async (req, res) => {
  const { objetivo_id, texto } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO subtareas (objetivo_id, texto, completado) VALUES ($1, $2, 0) RETURNING *',
      [objetivo_id, texto]
    );
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando subtarea');
  }
});

// Alternar estado (Completada/Pendiente)
router.put('/alternar/:id', async (req, res) => {
  const { completado } = req.body;
  try {
    // Convertimos boicoteos de JS a un entero 1 o 0 para la base de datos
    const estadoInt = completado ? 1 : 0;
    await pool.query('UPDATE subtareas SET completado = $1 WHERE id = $2', [estadoInt, req.params.id]);
    res.json({ msg: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error actualizando subtarea');
  }
});

module.exports = router;