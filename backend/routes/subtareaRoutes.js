const express = require('express');
const router = express.Router();
const pool = require('../db');

// 🔍 Obtener todas las subtareas de una meta concreta
router.get('/:objetivo_id', async (req, res) => {
  try {
    const [resultado] = await pool.query(
      'SELECT * FROM subtareas WHERE objetivo_id = ? ORDER BY id ASC', 
      [req.params.objetivo_id]
    );
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo subtareas');
  }
});

// 📝 Crear una subtarea nueva
router.post('/crear', async (req, res) => {
  const { objetivo_id, texto } = req.body;
  try {
    const [resultado] = await pool.query(
      'INSERT INTO subtareas (objetivo_id, texto, completado) VALUES (?, ?, 0)',
      [objetivo_id, texto]
    );
    // En MySQL, el ID autoincremental de la nueva fila viene en resultado.insertId
    res.json({ 
      id: resultado.insertId, 
      objetivo_id, 
      texto, 
      completado: 0 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando subtarea');
  }
});

// 🔄 Alternar el estado (Completado / Pendiente)
router.put('/alternar/:id', async (req, res) => {
  const { completado } = req.body;
  try {
    await pool.query(
      'UPDATE subtareas SET completado = ? WHERE id = ?', 
      [completado, req.params.id]
    );
    res.json({ msg: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error actualizando subtarea');
  }
});


// 🗑️ Eliminar una subtarea individual
router.delete('/eliminar/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM subtareas WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Subtarea eliminada con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar subtarea');
  }
});
module.exports = router;