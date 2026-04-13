const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ── FUNCIÓN PARA GENERAR TOKEN ───────────────────────────────
// Recibe el ID del usuario y genera un token firmado
const generarToken = (userId) => {
  return jwt.sign(
    { id: String(userId) },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ── REGISTRO DE NUEVO USUARIO ────────────────────────────────
// Método HTTP: POST
// URL: /api/auth/registro
const registro = async (req, res) => {
  try {
    const { nombreCompleto, documento, contrasena, dependencia, rol } = req.body;

    if (!nombreCompleto || !documento || !contrasena || !dependencia) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    // Verificamos que no exista ya un usuario con ese documento
    const usuarioExistente = await Usuario.findOne({ documento });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese documento',
      });
    }

    // Solo un admin puede crear otro admin
    // Si no se especifica rol, se asigna 'usuario' por defecto
    const nuevoRol = rol === 'admin' ? 'admin' : 'usuario';

    const usuario = await Usuario.create({
      nombreCompleto,
      documento,
      contrasena, // El middleware pre('save') la encripta automáticamente
      dependencia,
      rol: nuevoRol,
    });

    // Generamos el token para que el usuario quede logueado inmediatamente
    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      data: {
        id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        documento: usuario.documento,
        dependencia: usuario.dependencia,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message,
    });
  }
};

// ── LOGIN ────────────────────────────────────────────────────
// Método HTTP: POST
// URL: /api/auth/login
const login = async (req, res) => {
  try {
    const { documento, contrasena } = req.body;

    if (!documento || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'El documento y la contraseña son obligatorios',
      });
    }

    // Buscamos el usuario por documento
    // Necesitamos .select('+contrasena') porque en el modelo
    // definimos select: false para la contraseña
    const usuario = await Usuario.findOne({ documento }).select('+contrasena');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Documento o contraseña incorrectos',
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.',
      });
    }

    // Comparamos la contraseña ingresada con la encriptada
    const contrasenaCorrecta = await usuario.compararContrasena(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        success: false,
        message: 'Documento o contraseña incorrectos',
      });
    }

   // Si todo está bien, generamos el token
const token = generarToken(usuario._id);

res.status(200).json({
  success: true,
  message: `Bienvenido, ${usuario.nombreCompleto}`,
  token,
  data: {
    id: usuario._id,
    nombreCompleto: usuario.nombreCompleto,
    documento: usuario.documento,
    dependencia: usuario.dependencia,
    rol: usuario.rol,
  },
});
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Error al iniciar sesión',
    error: error.message,
  });
}
};

// ── OBTENER PERFIL ACTUAL ────────────────────────────────────
// Método HTTP: GET
// URL: /api/auth/perfil
// Requiere token
const obtenerPerfil = async (req, res) => {
try {
  // req.usuario viene del middleware proteger
  res.status(200).json({
    success: true,
    data: {
      id: req.usuario._id,
      nombreCompleto: req.usuario.nombreCompleto,
      documento: req.usuario.documento,
      dependencia: req.usuario.dependencia,
      rol: req.usuario.rol,
    },
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Error al obtener el perfil',
    error: error.message,
  });
}
};

module.exports = { registro, login, obtenerPerfil };