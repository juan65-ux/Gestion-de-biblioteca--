const Usuario = require('../models/Usuario');

// ── LISTAR USUARIOS (SOLO ADMIN) ─────────────────────────────
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: usuarios.length,
      data: usuarios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: error.message,
    });
  }
};

// ── ACTIVAR / DESACTIVAR USUARIO (SOLO ADMIN) ────────────────
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo activo debe ser true o false',
      });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

   res.status(200).json({
      success: true,
      message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`,
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: error.message,
    });
  }
};

module.exports = { listarUsuarios, cambiarEstadoUsuario };