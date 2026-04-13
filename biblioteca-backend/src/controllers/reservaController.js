const ReservaSala = require('../models/ReservaSala');

// ─────────────────────────────────────────────
// FUNCIÓN AUXILIAR: Verificar cruce de horarios
// Esta función NO es un endpoint, es una herramienta interna
// ─────────────────────────────────────────────
const verificarCruceHorario = async (fecha, horaInicio, horaFin, excludeId = null) => {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setUTCHours(0, 0, 0, 0);
  const fechaSiguiente = new Date(fechaBusqueda);
  fechaSiguiente.setUTCDate(fechaSiguiente.getUTCDate() + 1);

  const query = {
    fecha: { $gte: fechaBusqueda, $lt: fechaSiguiente },
    estado: 'activa',
    $and: [
      { horaInicio: { $lt: horaFin } },
      { horaFin: { $gt: horaInicio } },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const reservaExistente = await ReservaSala.findOne(query);
  return reservaExistente;
};

// ─────────────────────────────────────────────
// CREAR UNA RESERVA
// Método HTTP: POST
// URL: /api/reservas
// ─────────────────────────────────────────────
const crearReserva = async (req, res) => {
  try {
    const { nombreSolicitante, fecha, horaInicio, horaFin, motivo } = req.body;

    if (!nombreSolicitante || !fecha || !horaInicio || !horaFin || !motivo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: nombreSolicitante, fecha, horaInicio, horaFin, motivo',
      });
    }

    if (horaInicio >= horaFin) {
      return res.status(400).json({
        success: false,
        message: 'La horaFin debe ser posterior a horaInicio',
      });
    }

    const conflicto = await verificarCruceHorario(fecha, horaInicio, horaFin);

    if (conflicto) {
      return res.status(409).json({
        success: false,
        message: `Ya existe una reserva activa que se cruza con ese horario: "${conflicto.nombreSolicitante}" de ${conflicto.horaInicio} a ${conflicto.horaFin}`,
        conflicto: {
          id: conflicto._id,
          solicitante: conflicto.nombreSolicitante,
          horaInicio: conflicto.horaInicio,
          horaFin: conflicto.horaFin,
        },
      });
    }

    const reserva = await ReservaSala.create({
      nombreSolicitante,
      fecha: new Date(fecha),
      horaInicio,
      horaFin,
      motivo,
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada correctamente',
      data: reserva,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la reserva',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// CANCELAR UNA RESERVA
// Método HTTP: PATCH
// URL: /api/reservas/:id/cancelar
// ─────────────────────────────────────────────
const cancelarReserva = async (req, res) => {
  try {
    const reserva = await ReservaSala.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }

    if (reserva.estado === 'cancelada') {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya fue cancelada anteriormente',
      });
    }

    reserva.estado = 'cancelada';
    await reserva.save();

    res.status(200).json({
      success: true,
      message: 'Reserva cancelada correctamente',
      data: reserva,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la reserva',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// LISTAR RESERVAS POR FECHA
// Método HTTP: GET
// URL: /api/reservas?fecha=2024-06-15
// ─────────────────────────────────────────────
const listarReservasPorFecha = async (req, res) => {
  try {
    const { fecha, estado } = req.query;

    const filtro = {};

    if (fecha) {
      const inicioDia = new Date(fecha);
      inicioDia.setUTCHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setUTCHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicioDia, $lte: finDia };
    }

    if (estado) filtro.estado = estado;

    const reservas = await ReservaSala.find(filtro).sort({ fecha: 1, horaInicio: 1 });

    res.status(200).json({
      success: true,
      total: reservas.length,
      data: reservas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar las reservas',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// OBTENER UNA RESERVA POR ID
// Método HTTP: GET
// URL: /api/reservas/:id
// ─────────────────────────────────────────────
const obtenerReserva = async (req, res) => {
  try {
    const reserva = await ReservaSala.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: reserva,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la reserva',
      error: error.message,
    });
  }
};

module.exports = {
  crearReserva,
  cancelarReserva,
  listarReservasPorFecha,
  obtenerReserva,
};
