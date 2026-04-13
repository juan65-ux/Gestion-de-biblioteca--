const express = require('express');
const router = express.Router();

const {
  solicitarPrestamo,
  finalizarPrestamo,
  listarPrestamosActivos,
  historialPrestamos,
  obtenerPrestamo,
} = require('../controllers/prestamoController');

// POST /api/prestamos → Solicitar un préstamo
router.post('/', solicitarPrestamo);

// GET /api/prestamos/activos → Lista préstamos activos
// ⚠️ IMPORTANTE: Esta ruta debe ir ANTES de /:id
// Si va después, Express pensaría que "activos" es un ID
router.get('/activos', listarPrestamosActivos);

// GET /api/prestamos/historial → Historial completo
router.get('/historial', historialPrestamos);

// GET /api/prestamos/:id → Obtiene un préstamo por ID
router.get('/:id', obtenerPrestamo);

// PATCH /api/prestamos/:id/finalizar → Finaliza un préstamo
router.patch('/:id/finalizar', finalizarPrestamo);

module.exports = router;