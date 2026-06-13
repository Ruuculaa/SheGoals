const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:objetivo_id', async (req, res) => {
  try {
    const [resultado] = await pool.query('SELECT * FROM subtareas WHERE objetivo_id = ? ORDER BY id ASC', [req.params.objetivo_id]);
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo subtareas');
  }
});

router.post('/crear', async (req, res) => {
  const { objetivo_id, texto } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO subtareas (objetivo_id, texto, completado) VALUES (?, ?, 0)',
      [objetivo_id, texto]
    );
    // MySQL devuelve el ID en insertId
    res.json({ id: resultado.insertId, objetivo_id, texto, completado: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando subtarea');
  }
});

router.put('/alternar/:id', async (req, res) => {
  const { completado } = req.body;
  try {
    await pool.query('UPDATE subtareas SET completado = ? WHERE id = ?', [completado, req.params.id]);
    res.json({ msg: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error actualizando subtarea');
  }
});

module.exports = router;