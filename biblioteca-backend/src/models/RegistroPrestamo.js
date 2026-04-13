const mongoose = require('mongoose');

const registroPrestamoSchema = new mongoose.Schema(
  {
    // Datos del solicitante
    nombreCompleto: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
    },

    documento: {
      type: String,
      required: [true, 'El documento es obligatorio'],
      trim: true,
    },

    dependencia: {
      type: String,
      required: [true, 'La dependencia es obligatoria'],
      trim: true,
    },

    // Referencia al usuario si está registrado en el sistema
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },

    // Equipo prestado
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo es obligatorio'],
    },

    // Fechas del préstamo
    fechaSalida: {
      type: Date,
      required: [true, 'La fecha de salida es obligatoria'],
    },

    fechaDevolucion: {
      type: Date,
      default: null, // Se llena cuando el usuario devuelve el equipo
    },

    // El usuario confirma que recibió el equipo en buen estado
    // false = no ha confirmado, true = confirmó recibido
    recibido: {
      type: Boolean,
      default: false,
    },

    // Fecha exacta en que confirmó el recibido
    fechaRecibido: {
      type: Date,
      default: null,
    },

    estado: {
      type: String,
      enum: {
        values: ['activo', 'finalizado', 'cancelado'],
        message: 'Estado inválido',
      },
      default: 'activo',
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

const RegistroPrestamo = mongoose.model('RegistroPrestamo', registroPrestamoSchema);

module.exports = RegistroPrestamo;