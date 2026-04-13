const mongoose = require('mongoose');

const reservaSalaSchema = new mongoose.Schema(
  {
    nombreSolicitante: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },

    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      // Validamos que el formato sea HH:MM (ej: "08:00", "14:30")
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido. Use HH:MM'],
    },

    horaFin: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido. Use HH:MM'],
    },

    motivo: {
      type: String,
      required: [true, 'El motivo de la reserva es obligatorio'],
      trim: true,
    },

    estado: {
      type: String,
      enum: {
        values: ['activa', 'cancelada'],
        message: 'El estado debe ser activa o cancelada',
      },
      default: 'activa',
    },
  },
  {
    timestamps: true,
  }
);

const ReservaSala = mongoose.model('ReservaSala', reservaSalaSchema);

module.exports = ReservaSala;