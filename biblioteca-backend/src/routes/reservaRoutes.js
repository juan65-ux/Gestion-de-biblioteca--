const express = require('express');
const router = express.Router();

const {
  crearReserva,
  cancelarReserva,
  listarReservasPorFecha,
  obtenerReserva,
} = require('../controllers/reservaController');

// GET /api/reservas → Lista reservas (con filtro por ?fecha=YYYY-MM-DD)
// POST /api/reservas → Crea una reserva
router.route('/').get(listarReservasPorFecha).post(crearReserva);

// GET /api/reservas/:id → Obtiene una reserva por ID
router.get('/:id', obtenerReserva);

// PATCH /api/reservas/:id/cancelar → Cancela una reserva
router.patch('/:id/cancelar', cancelarReserva);

module.exports = router;