const express = require('express');

// express.Router() crea un mini-aplicación que maneja un grupo de rutas
const router = express.Router();

const {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  cambiarEstadoEquipo,
  actualizarEquipo,
  eliminarEquipo,
} = require('../controllers/equipoController');

// GET /api/equipos → Lista todos los equipos (con filtros opcionales)
// POST /api/equipos → Crea un nuevo equipo
router.route('/').get(listarEquipos).post(crearEquipo);

// GET /api/equipos/:id → Obtiene un equipo por su ID
// PUT /api/equipos/:id → Actualiza los datos de un equipo
// DELETE /api/equipos/:id → Elimina un equipo
router.route('/:id').get(obtenerEquipo).put(actualizarEquipo).delete(eliminarEquipo);

// PATCH /api/equipos/:id/estado → Cambia solo el estado del equipo
router.patch('/:id/estado', cambiarEstadoEquipo);

module.exports = router;