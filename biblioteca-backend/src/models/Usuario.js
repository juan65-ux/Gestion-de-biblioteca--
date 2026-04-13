const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombreCompleto: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
    },

    documento: {
      type: String,
      required: [true, 'El documento de identidad es obligatorio'],
      unique: true, // No pueden existir dos usuarios con el mismo documento
      trim: true,
    },

    contrasena: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener mínimo 6 caracteres'],
      // select: false hace que la contraseña NUNCA se devuelva en las consultas
      // Es una medida de seguridad importante
      select: false,
    },

    dependencia: {
      type: String,
      required: [true, 'La dependencia es obligatoria'],
      trim: true,
    },

    rol: {
      type: String,
      enum: {
        values: ['admin', 'usuario'],
        message: 'El rol debe ser admin o usuario',
      },
      default: 'usuario',
    },

    activo: {
      type: Boolean,
      default: true, // El admin puede desactivar usuarios sin borrarlos
    },
  },
  {
    timestamps: true,
  }
);

// ── MIDDLEWARE DE MONGOOSE ───────────────────────────────────
// Esta función se ejecuta AUTOMÁTICAMENTE antes de guardar un usuario
// Si la contraseña fue modificada, la encripta
usuarioSchema.pre('save', async function () {
  if (!this.isModified('contrasena')) return;
  this.contrasena = await bcrypt.hash(this.contrasena, 12);
});

// ── MÉTODO PERSONALIZADO ─────────────────────────────────────
// Agregamos un método al modelo para comparar contraseñas
// Lo usaremos en el login
usuarioSchema.methods.compararContrasena = async function (contrasenaIngresada, contrasenaGuardada) {
  // bcrypt.compare compara la contraseña ingresada con la encriptada
  // Devuelve true si coinciden, false si no
  return await bcrypt.compare(contrasenaIngresada, contrasenaGuardada);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;