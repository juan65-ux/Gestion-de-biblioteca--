const express = require('express');
const router = express.Router();
const { registro, login, obtenerPerfil } = require('../controllers/authController');
const { proteger } = require('../middlewares/auth');

// POST /api/auth/registro → Registrar nuevo usuario
router.post('/registro', registro);

// POST /api/auth/login → Iniciar sesión
router.post('/login', login);

// GET /api/auth/perfil → Ver perfil (requiere token)
router.get('/perfil', proteger, obtenerPerfil);

module.exports = router;