const express = require('express');
const router = express.Router();
const {
  crearRegistro,
  confirmarRecibido,
  registrarDevolucion,
  cancelarRegistro,
  misRegistros,
  buscarRegistros,
} = require('../controllers/registroPrestamoController');
const { proteger, soloAdmin } = require('../middlewares/auth');

// POST /api/registros → Crear registro (usuarios logueados)
router.post('/', proteger, crearRegistro);

// GET /api/registros/mis-registros → Ver mis registros activos
router.get('/mis-registros', proteger, misRegistros);

// GET /api/registros/buscar → Buscar por fecha (solo admin)
router.get('/buscar', proteger, soloAdmin, buscarRegistros);

// PATCH /api/registros/:id/recibido → Confirmar recibido
router.patch('/:id/recibido', proteger, confirmarRecibido);

// PATCH /api/registros/:id/devolucion → Registrar devolución
router.patch('/:id/devolucion', proteger, registrarDevolucion);

// PATCH /api/registros/:id/cancelar → Cancelar registro
router.patch('/:id/cancelar', proteger, cancelarRegistro);

module.exports = router;