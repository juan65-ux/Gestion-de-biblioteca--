const express = require('express');
const router = express.Router();
const { listarUsuarios, cambiarEstadoUsuario } = require('../controllers/usuarioController');
const { proteger, soloAdmin } = require('../middlewares/auth');

// Todas las rutas de usuarios requieren ser admin
// GET /api/usuarios → Listar todos los usuarios
router.get('/', proteger, soloAdmin, listarUsuarios);

// PATCH /api/usuarios/:id/estado → Activar o desactivar usuario
router.patch('/:id/estado', proteger, soloAdmin, cambiarEstadoUsuario);

module.exports = router;