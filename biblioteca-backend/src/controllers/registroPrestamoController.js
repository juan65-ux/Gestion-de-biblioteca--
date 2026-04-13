const RegistroPrestamo = require('../models/RegistroPrestamo');
const Equipo = require('../models/Equipo');

// ── CREAR REGISTRO DE PRÉSTAMO ───────────────────────────────
// Método HTTP: POST
// URL: /api/registros
const crearRegistro = async (req, res) => {
  try {
    const {
      nombreCompleto,
      documento,
      dependencia,
      equipoId,
      fechaSalida,
      observaciones,
    } = req.body;

    if (!nombreCompleto || !documento || !dependencia || !equipoId || !fechaSalida) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombreCompleto, documento, dependencia, equipoId y fechaSalida son obligatorios',
      });
    }

    // Verificar que el equipo existe y está disponible
    const equipo = await Equipo.findById(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'El equipo no existe',
      });
    }

   if (equipo.estado !== 'disponible') {
      return res.status(400).json({
        success: false,
        message: `El equipo no está disponible. Estado actual: ${equipo.estado}`,
      });
    }

    // Creamos el registro
    const registro = await RegistroPrestamo.create({
      nombreCompleto,
      documento,
      dependencia,
      usuario: req.usuario._id,
      equipo: equipoId,
      fechaSalida: new Date(fechaSalida),
      observaciones,
    });

    // Cambiamos el estado del equipo a prestado
    await Equipo.findByIdAndUpdate(equipoId, { estado: 'prestado' });

    const registroCompleto = await RegistroPrestamo.findById(registro._id)
      .populate('equipo')
      .populate('usuario', 'nombreCompleto documento dependencia');

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado correctamente',
      data: registroCompleto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el registro',
      error: error.message,
    });
  }
};

// ── CONFIRMAR RECIBIDO ───────────────────────────────────────
// Método HTTP: PATCH
// URL: /api/registros/:id/recibido
const confirmarRecibido = async (req, res) => {
  try {
    const registro = await RegistroPrestamo.findById(req.params.id);

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }

    if (registro.recibido) {
      return res.status(400).json({
        success: false,
        message: 'Este préstamo ya fue confirmado como recibido',
      });
    }

    registro.recibido = true;
    registro.fechaRecibido = new Date();
    await registro.save();

    res.status(200).json({
      success: true,
      message: 'Recibido confirmado correctamente',
      data: registro,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el recibido',
      error: error.message,
    });
  }
};

// ── REGISTRAR DEVOLUCIÓN ─────────────────────────────────────
// Método HTTP: PATCH
// URL: /api/registros/:id/devolucion
const registrarDevolucion = async (req, res) => {
  try {
    const registro = await RegistroPrestamo.findById(req.params.id)
      .populate('equipo');

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }

    if (registro.estado === 'finalizado') {
      return res.status(400).json({
        success: false,
        message: 'Este préstamo ya fue finalizado',
      });
    }

    // Registramos la devolución
    registro.fechaDevolucion = new Date();
    registro.estado = 'finalizado';
    await registro.save();

    // Devolvemos el equipo a disponible
    await Equipo.findByIdAndUpdate(registro.equipo._id, { estado: 'disponible' });

    res.status(200).json({
      success: true,
      message: 'Devolución registrada. Equipo disponible nuevamente.',
      data: registro,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar la devolución',
      error: error.message,
    });
  }
};

// ── CANCELAR REGISTRO ────────────────────────────────────────
// Método HTTP: PATCH
// URL: /api/registros/:id/cancelar
const cancelarRegistro = async (req, res) => {
  try {
    const registro = await RegistroPrestamo.findById(req.params.id)
      .populate('equipo');

    if (!registro) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }

    if (registro.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cancelar registros activos',
      });
    }

    registro.estado = 'cancelado';
    await registro.save();

    // Devolvemos el equipo a disponible
    await Equipo.findByIdAndUpdate(registro.equipo._id, { estado: 'disponible' });

    res.status(200).json({
      success: true,
      message: 'Registro cancelado correctamente',
      data: registro,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar el registro',
      error: error.message,
    });
  }
};

// ── LISTAR REGISTROS DEL USUARIO LOGUEADO ───────────────────
// Método HTTP: GET
// URL: /api/registros/mis-registros
const misRegistros = async (req, res) => {
  try {
    // Incluye préstamos vinculados al usuario O con el mismo documento (p. ej. creados por admin).
    const registros = await RegistroPrestamo.find({
      estado: 'activo',
      $or: [
        { usuario: req.usuario._id },
        { documento: req.usuario.documento },
      ],
    })
      .populate('equipo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: registros.length,
      data: registros,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus registros',
      error: error.message,
    });
  }
};

// ── BUSCAR REGISTROS POR FECHA (SOLO ADMIN) ──────────────────
// Método HTTP: GET
// URL: /api/registros/buscar?fecha=2024-06-15
// URL: /api/registros/buscar?fechaInicio=2024-06-01&fechaFin=2024-06-30
const buscarRegistros = async (req, res) => {
  try {
    const { fecha, fechaInicio, fechaFin, documento, estado } = req.query;

    const filtro = {};

    // Filtro por un día específico
    if (fecha) {
      const inicioDia = new Date(fecha);
      inicioDia.setUTCHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setUTCHours(23, 59, 59, 999);
      filtro.fechaSalida = { $gte: inicioDia, $lte: finDia };
    }

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setUTCHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setUTCHours(23, 59, 59, 999);
      filtro.fechaSalida = { $gte: inicio, $lte: fin };
    }

    // Filtro por documento del solicitante
    if (documento) {
      filtro.documento = { $regex: documento, $options: 'i' };
    }

    // Filtro por estado
    if (estado) filtro.estado = estado;

    const registros = await RegistroPrestamo.find(filtro)
      .populate('equipo')
      .populate('usuario', 'nombreCompleto documento dependencia')
      .sort({ fechaSalida: -1 });

    res.status(200).json({
      success: true,
      total: registros.length,
      data: registros,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al buscar los registros',
      error: error.message,
    });
  }
};

// ── AUTO-DEVOLUCIÓN AL CIERRE DE JORNADA ───────────────────────
// Cierra todos los registros activos y libera los equipos.
// Se usa desde el scheduler del servidor (no requiere endpoint).
const autoDevolverRegistrosActivos = async () => {
  const activos = await RegistroPrestamo.find({ estado: 'activo' }).populate('equipo');

  if (!activos.length) {
    return { total: 0 };
  }

  const fechaCierre = new Date();
  let actualizados = 0;

  for (const registro of activos) {
    registro.estado = 'finalizado';
    registro.fechaDevolucion = fechaCierre;
    await registro.save();

    if (registro.equipo?._id) {
      await Equipo.findByIdAndUpdate(registro.equipo._id, { estado: 'disponible' });
    }

    actualizados += 1;
  }

  return { total: actualizados };
};

module.exports = {
  crearRegistro,
  confirmarRecibido,
  registrarDevolucion,
  cancelarRegistro,
  misRegistros,
  buscarRegistros,
  autoDevolverRegistrosActivos,
};