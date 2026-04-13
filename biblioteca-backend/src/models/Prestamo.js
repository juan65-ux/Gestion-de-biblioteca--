const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema(
  {
    // Nombre de la persona que toma prestado el equipo
    nombreSolicitante: {
      type: String,
      required: [true, 'El nombre del solicitante es obligatorio'],
      trim: true,
    },

    // Cargo o área donde trabaja (ej: "Docente", "Coordinación", "Secretaría")
    cargoArea: {
      type: String,
      required: [true, 'El cargo o área es obligatorio'],
      trim: true,
    },

    // Referencia al equipo que se presta
    // ObjectId es el tipo de ID que usa MongoDB
    // ref: 'Equipo' le dice a Mongoose que este ID pertenece al modelo Equipo
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo es obligatorio'],
    },

    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },

    fechaFin: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria'],
    },

    // Estado del préstamo en sí mismo (no del equipo)
    estado: {
      type: String,
      enum: {
        values: ['activo', 'finalizado'],
        message: 'El estado debe ser activo o finalizado',
      },
      default: 'activo',
    },

    // Fecha real en que se devolvió el equipo (se llena al finalizar)
    fechaDevolucion: {
      type: Date,
      default: null,
    },

    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Prestamo = mongoose.model('Prestamo', prestamoSchema);

module.exports = Prestamo;