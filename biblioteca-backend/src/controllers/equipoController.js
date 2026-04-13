// Importamos el modelo para poder hacer consultas a la base de datos
const Equipo = require('../models/Equipo');

// ─────────────────────────────────────────────
// CREAR UN NUEVO EQUIPO
// Método HTTP: POST
// URL: /api/equipos
// ─────────────────────────────────────────────
const crearEquipo = async (req, res) => {
  try {
    // req.body contiene los datos que envió el cliente en el cuerpo de la petición
    const { nombre, tipo, serial, descripcion } = req.body;

    // Verificamos que los campos obligatorios vengan en la petición
    if (!nombre || !tipo || !serial) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, tipo y serial son obligatorios',
      });
    }

    // Creamos el equipo en la base de datos con los datos recibidos
    // Mongoose automáticamente valida que tipo y serial cumplan las reglas del modelo
    const equipo = await Equipo.create({ nombre, tipo, serial, descripcion });

    // Respondemos con código 201 (Created) y los datos del equipo creado
    res.status(201).json({
      success: true,
      message: 'Equipo creado correctamente',
      data: equipo,
    });
  } catch (error) {
    // Si el serial ya existe, MongoDB lanza un error con código 11000
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un equipo con ese serial',
      });
    }
    // Para cualquier otro error, lo pasamos al manejador global
    res.status(500).json({
      success: false,
      message: 'Error al crear el equipo',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// LISTAR TODOS LOS EQUIPOS
// Método HTTP: GET
// URL: /api/equipos
// ─────────────────────────────────────────────
const listarEquipos = async (req, res) => {
  try {
    // req.query son los parámetros que vienen en la URL después del ?
    // Por ejemplo: /api/equipos?estado=disponible
    const { estado, tipo } = req.query;

    // Construimos el filtro dinámicamente
    // Si no viene ningún filtro, el objeto queda vacío {} y trae todos
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (tipo) filtro.tipo = tipo;

    // find() busca todos los documentos que cumplan el filtro
    // sort({ createdAt: -1 }) los ordena del más nuevo al más viejo
    const equipos = await Equipo.find(filtro).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: equipos.length,
      data: equipos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar los equipos',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// OBTENER UN EQUIPO POR SU ID
// Método HTTP: GET
// URL: /api/equipos/:id
// ─────────────────────────────────────────────
const obtenerEquipo = async (req, res) => {
  try {
    // req.params.id es el ID que viene en la URL
    // Por ejemplo, si la URL es /api/equipos/64abc123, req.params.id = "64abc123"
    const equipo = await Equipo.findById(req.params.id);

    // Si no encuentra nada, findById devuelve null
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: equipo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el equipo',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// CAMBIAR ESTADO DEL EQUIPO
// Método HTTP: PATCH
// URL: /api/equipos/:id/estado
// ─────────────────────────────────────────────
const cambiarEstadoEquipo = async (req, res) => {
  try {
    const { estado } = req.body;

    // Verificamos que el estado enviado sea uno de los válidos
    const estadosValidos = ['disponible', 'prestado', 'mantenimiento'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `El estado debe ser uno de: ${estadosValidos.join(', ')}`,  // ✅ Corregido
      });
    }

    // findByIdAndUpdate busca por ID y actualiza en una sola operación
    // { new: true } hace que devuelva el documento DESPUÉS de actualizar (no el anterior)
    // { runValidators: true } asegura que se corran las validaciones del modelo
    const equipo = await Equipo.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: `Estado del equipo actualizado a "${estado}"`,  // ✅ Corregido
      data: equipo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// ACTUALIZAR DATOS DEL EQUIPO
// Método HTTP: PUT
// URL: /api/equipos/:id
// ─────────────────────────────────────────────
const actualizarEquipo = async (req, res) => {
  try {
    const { nombre, tipo, serial, descripcion } = req.body;

    const equipo = await Equipo.findByIdAndUpdate(
      req.params.id,
      { nombre, tipo, serial, descripcion },
      { new: true, runValidators: true }
    );

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Equipo actualizado correctamente',
      data: equipo,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un equipo con ese serial',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el equipo',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// ELIMINAR UN EQUIPO
// Método HTTP: DELETE
// URL: /api/equipos/:id
// ─────────────────────────────────────────────
const eliminarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado',
      });
    }

    // No permitimos eliminar un equipo que está prestado actualmente
    if (equipo.estado === 'prestado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un equipo que está prestado actualmente',
      });
    }

    await Equipo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Equipo eliminado correctamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el equipo',
      error: error.message,
    });
  }
};

// Exportamos todas las funciones para usarlas en las rutas
module.exports = {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  cambiarEstadoEquipo,
  actualizarEquipo,
  eliminarEquipo,
};