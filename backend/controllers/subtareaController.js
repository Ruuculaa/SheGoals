const db = require('../db');

// 1. Listar subtareas de un objetivo específico
exports.listarSubtareas = async (req, res) => {
    const { objetivo_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM subtareas WHERE objetivo_id = ? ORDER BY id ASC', [objetivo_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error al listar subtareas' });
    }
};

// 2. Crear una nueva subtarea
exports.crearSubtarea = async (req, res) => {
    const { objetivo_id, texto } = req.body;
    try {
        await db.query('INSERT INTO subtareas (objetivo_id, texto) VALUES (?, ?)', [objetivo_id, texto]);
        res.json({ msg: 'Subtarea añadida' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear subtarea' });
    }
};

// 3. Alternar estado (Completado / Pendiente)
exports.alternarSubtarea = async (req, res) => {
    const { id } = req.params;
    const { completado } = req.body; // Recibe 1 o 0
    try {
        await db.query('UPDATE subtareas SET completado = ? WHERE id = ?', [completado, id]);
        res.json({ msg: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar subtarea' });
    }
};