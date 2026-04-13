const mongoose = require('mongoose');

// Definimos el esquema (la estructura) de un equipo
const equipoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del equipo es obligatorio'],
      trim: true, // Elimina espacios al inicio y al final
    },

    tipo: {
      type: String,
      // Solo permite estos dos valores exactos
      enum: {
        values: ['computador_portatil', 'video_beam'],
        message: 'El tipo debe ser computador_portatil o video_beam',
      },
      required: [true, 'El tipo de equipo es obligatorio'],
    },

    serial: {
      type: String,
      required: [true, 'El serial es obligatorio'],
      unique: true, // No puede haber dos equipos con el mismo serial
      trim: true,
      uppercase: true, // Lo guarda siempre en mayúsculas
    },

    estado: {
      type: String,
      enum: {
        values: ['disponible', 'prestado', 'mantenimiento'],
        message: 'El estado debe ser disponible, prestado o mantenimiento',
      },
      default: 'disponible', // Cuando creas un equipo, empieza disponible
    },

    descripcion: {
      type: String,
      trim: true,
      default: '', // Campo opcional
    },
  },
  {
    // timestamps: true agrega automáticamente los campos:
    // createdAt (cuándo se creó) y updatedAt (cuándo se modificó por última vez)
    timestamps: true,
  }
);

// Creamos el modelo llamado 'Equipo' basado en el esquema
// MongoDB guardará los documentos en una colección llamada 'equipos' (en minúscula y plural)
const Equipo = mongoose.model('Equipo', equipoSchema);

module.exports = Equipo;