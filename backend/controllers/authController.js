const db = require('../db.js');
const bcrypt = require('bcryptjs');

// Función para registrar usuarias
exports.registrarUsuario = async (req, res) => {
    // Recibimos los datos que la usuaria escribe en el formulario
    const { nombre, email, password } = req.body;

    try {
        // 1. Validar si el email ya existe en la base de datos
        const [existeUsuario] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existeUsuario.length > 0) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }

        // 2. Encriptar la contraseña (hacerla ilegible)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // 3. Guardar la nueva usuaria en MySQL
        await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, passwordEncriptada]
        );

        res.status(201).json({ msg: '¡Usuaria registrada con éxito!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};

const jwt = require('jsonwebtoken'); // Asegúrate de que esta línea esté arriba si no estaba

// Función para iniciar sesión (Login)
exports.loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Verificar si la usuaria existe
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) {
            return res.status(400).json({ msg: 'El email o la contraseña no son correctos' });
        }

        const usuario = usuarios[0];

        // 2. Verificar si la contraseña coincide con la encriptada
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(400).json({ msg: 'El email o la contraseña no son correctos' });
        }

        // 3. Si todo es correcto, crear el token JWT
        // Guardamos el ID de la usuaria dentro del token para saber quién es
        const payload = { usuarioId: usuario.id };

        // Firmamos el token con una palabra secreta (la definiremos en el .env)
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h' // El token caduca en un día por seguridad
        });

        // Enviamos el token al cliente
        res.json({ 
            msg: '¡Inicio de sesión correcto!',
            token: token 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Hubo un error en el servidor' });
    }
};