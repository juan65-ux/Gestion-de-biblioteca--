const Prestamo = require('../models/Prestamo');
const Equipo = require('../models/Equipo');

// ─────────────────────────────────────────────
// SOLICITAR UN PRÉSTAMO
// Método HTTP: POST
// URL: /api/prestamos
// ─────────────────────────────────────────────
const solicitarPrestamo = async (req, res) => {
  try {
    const { nombreSolicitante, cargoArea, equipoId, fechaInicio, fechaFin, observaciones } = req.body;

    // Validación 1: Campos obligatorios
    if (!nombreSolicitante || !cargoArea || !equipoId || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombreSolicitante, cargoArea, equipoId, fechaInicio y fechaFin son obligatorios',
      });
    }

    // Validación 2: Fechas coherentes
    // Convertimos los strings de fecha a objetos Date para poder compararlos
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio >= fin) {
      return res.status(400).json({
        success: false,
        message: 'La fechaFin debe ser posterior a la fechaInicio',
      });
    }

    // Validación 3: Que el equipo exista en la base de datos
    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'El equipo solicitado no existe',
      });
    }

    // Validación 4: Que el equipo esté disponible
    // Si está "prestado" o en "mantenimiento", no podemos prestarlo
    if (equipo.estado !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: `El equipo no está disponible. Estado actual: ${equipo.estado}`,  // ✅ Corregido
      });
    }

    // Si pasó todas las validaciones, creamos el préstamo
    const prestamo = await Prestamo.create({
      nombreSolicitante,
      cargoArea,
      equipo: equipoId, // Guardamos el ID del equipo
      fechaInicio: inicio,
      fechaFin: fin,
      observaciones,
    });

    // Automáticamente cambiamos el estado del equipo a "prestado"
    // Esto es crítico: así el sistema sabe que ya no está disponible
    await Equipo.findByIdAndUpdate(equipoId, { estado: 'prestado' });

    // Usamos populate para que la respuesta incluya los datos completos
    // del equipo, no solo su ID
    const prestamoConEquipo = await Prestamo.findById(prestamo._id).populate('equipo');

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado correctamente. El equipo ahora está marcado como prestado.',
      data: prestamoConEquipo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el préstamo',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// FINALIZAR UN PRÉSTAMO
// Método HTTP: PATCH
// URL: /api/prestamos/:id/finalizar
// ─────────────────────────────────────────────
const finalizarPrestamo = async (req, res) => {
  try {
    // Buscamos el préstamo y traemos los datos del equipo relacionado
    const prestamo = await Prestamo.findById(req.params.id).populate('equipo');

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
      });
    }

    // No tiene sentido finalizar algo que ya fue finalizado
    if (prestamo.estado === 'finalizado') {
      return res.status(400).json({
        success: false,
        message: 'Este préstamo ya fue finalizado anteriormente',
      });
    }

    // Actualizamos el préstamo: lo marcamos como finalizado
    // y registramos la fecha y hora exacta de devolución
    prestamo.estado = 'finalizado';
    prestamo.fechaDevolucion = new Date();
    await prestamo.save();

    // Devolvemos el equipo: cambiamos su estado a "disponible" de nuevo
    // prestamo.equipo._id es el ID del equipo gracias al populate
    await Equipo.findByIdAndUpdate(prestamo.equipo._id, { estado: 'disponible' });

    res.status(200).json({
      success: true,
      message: 'Préstamo finalizado. El equipo ahora está disponible.',
      data: prestamo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al finalizar el préstamo',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// LISTAR PRÉSTAMOS ACTIVOS
// Método HTTP: GET
// URL: /api/prestamos/activos
// ─────────────────────────────────────────────
const listarPrestamosActivos = async (req, res) => {
  try {
    // Buscamos solo los préstamos con estado "activo"
    // populate('equipo') rellena los datos completos del equipo referenciado
    const prestamos = await Prestamo.find({ estado: 'activo' })
      .populate('equipo')
      .sort({ fechaInicio: -1 });

    res.status(200).json({
      success: true,
      total: prestamos.length,
      data: prestamos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar préstamos activos',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// HISTORIAL COMPLETO DE PRÉSTAMOS
// Método HTTP: GET
// URL: /api/prestamos/historial
// ─────────────────────────────────────────────
const historialPrestamos = async (req, res) => {
  try {
    // Traemos TODOS los préstamos sin filtrar por estado
    // También podemos filtrar por nombre si viene en la query
    const { nombreSolicitante } = req.query;

    const filtro = {};
    if (nombreSolicitante) {
      // La opción 'i' hace que la búsqueda no distinga mayúsculas/minúsculas
      filtro.nombreSolicitante = { $regex: nombreSolicitante, $options: 'i' };
    }

    const prestamos = await Prestamo.find(filtro)
      .populate('equipo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: prestamos.length,
      data: prestamos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// OBTENER UN PRÉSTAMO POR ID
// Método HTTP: GET
// URL: /api/prestamos/:id
// ─────────────────────────────────────────────
const obtenerPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id).populate('equipo');

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: prestamo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el préstamo',
      error: error.message,
    });
  }
};

module.exports = {
  solicitarPrestamo,
  finalizarPrestamo,
  listarPrestamosActivos,
  historialPrestamos,
  obtenerPrestamo,
};