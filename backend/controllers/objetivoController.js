const db = require('../db');

// Función para crear un nuevo objetivo
exports.crearObjetivo = async (req, res) => {
    const { titulo, descripcion, categoria, fecha_inicio, fecha_fin } = req.body;
    
    // Obtenemos el ID de la usuaria gracias al middleware anterior
    const usuario_id = req.usuario.usuarioId;

    try {
        // Insertar el objetivo vinculado a la usuaria actual
        const [resultado] = await db.query(
            'INSERT INTO objetivos (usuario_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)',
            [usuario_id, titulo, descripcion, categoria, fecha_inicio, fecha_fin]
        );

        res.status(201).json({
            msg: '¡Objetivo creado con éxito!',
            id_objetivo: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al guardar el objetivo' });
    }
};

// Función para obtener todos los objetivos de la usuaria conectada
exports.obtenerObjetivos = async (req, res) => {
    // El portero (middleware) ya nos dejó el ID de la usuaria en req.usuario.usuarioId
    const usuario_id = req.usuario.usuarioId;

    try {
        // Buscamos en MySQL solo los objetivos que le pertenecen a esta usuaria
        const [objetivos] = await db.query(
            'SELECT * FROM objetivos WHERE usuario_id = ?', 
            [usuario_id]
        );

        // Devolvemos la lista de objetivos (aunque sea una lista vacía)
        res.json(objetivos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al obtener los objetivos' });
    }
};

// Función para eliminar un objetivo
exports.eliminarObjetivo = async (req, res) => {
    const { id } = req.params; // Capturamos el id desde la URL
    const usuario_id = req.usuario.usuarioId; // Obtenemos el ID de la usuaria autenticada

    try {
        // Borramos el objetivo asegurándonos de que le pertenece a la usuaria actual
        const [resultado] = await db.query(
            'DELETE FROM objetivos WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ msg: 'Objetivo no encontrado o no autorizado' });
        }

        res.json({ msg: '¡Objetivo eliminado con éxito!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error al eliminar el objetivo' });
    }
};