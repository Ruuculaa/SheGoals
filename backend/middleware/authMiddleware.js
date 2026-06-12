const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Leer el token que viene en la cabecera (header) de la petición
    const token = req.header('Authorization');

    // 2. Si no hay token, denegar el acceso
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso no válido' });
    }

    try {
        // 3. Quitar la palabra 'Bearer ' si es que el frontend la añade, o dejar el token limpio
        const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

        // 4. Verificar y cifrar el token con nuestra palabra secreta
        const cifrado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        // 5. Añadir el ID de la usuaria a la petición para que el controlador sepa quién es
        req.usuario = cifrado;
        
        // 6. ¡Todo correcto! Pasamos al siguiente paso (el controlador)
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};