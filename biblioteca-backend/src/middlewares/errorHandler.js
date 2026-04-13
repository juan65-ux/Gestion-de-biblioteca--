const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Error de ID de MongoDB inválido (cuando envías un ID con formato incorrecto)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID de recurso inválido';
  }

  // Error de validación de Mongoose (cuando un campo no cumple las reglas)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Error de clave duplicada en MongoDB
  if (err.code === 11000) {
    statusCode = 400;
    const campo = Object.keys(err.keyValue)[0];
    message = `Ya existe un registro con ese valor en el campo: ${campo}`;
  }

  console.error(`❌ Error [${statusCode}]: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    // Solo mostramos el stack de error en desarrollo, no en producción
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;