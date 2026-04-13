const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ── VERIFICAR TOKEN ──────────────────────────────────────────
// Este middleware se agrega a cualquier ruta que quieras proteger
const proteger = async (req, res, next) => {
  try {
    let token;

    // El token viene en el header Authorization con formato:
    // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Si no hay token, el usuario no está autenticado
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No tienes autorización. Por favor inicia sesión.',
      });
    }

    // Verificamos que el token sea válido y no haya expirado
    // jwt.verify lanza un error si el token es inválido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id ?? decoded.userId ?? decoded.sub;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor inicia sesión nuevamente.',
      });
    }

    const usuario = await Usuario.findById(String(userId));

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'El usuario de este token ya no existe',
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
      });
    }

    // Guardamos el usuario en req para usarlo en los controladores
    req.usuario = usuario;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
    });
  }
};

// ── VERIFICAR ROL ────────────────────────────────────────────
// Este middleware verifica que el usuario tenga el rol correcto
// Se usa DESPUÉS de proteger
// Ejemplo: proteger, soloAdmin → solo admins pueden pasar
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción. Se requiere rol de administrador.',
    });
  }
  next();
};

module.exports = { proteger, soloAdmin };