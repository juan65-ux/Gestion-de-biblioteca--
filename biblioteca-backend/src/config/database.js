// Importamos mongoose, que es nuestra librería para hablar con MongoDB
const mongoose = require('mongoose');

// Creamos una función asíncrona porque conectarse a una base de datos
// toma tiempo (va por internet) y necesitamos esperar a que termine
const connectDB = async () => {
  try {
    // Intentamos conectarnos usando la URL que está en el archivo .env
    // process.env.MONGODB_URI lee esa variable de entorno
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // Si llegamos aquí, la conexión fue exitosa
    // conn.connection.host nos dice a qué servidor nos conectamos
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    // Si algo sale mal (URL incorrecta, sin internet, etc.)
    // mostramos el error y detenemos el proceso
    console.error(`❌ Error al conectar MongoDB: ${error.message}`);
    process.exit(1); // El 1 significa "salió con error"
  }
};

// Exportamos la función para usarla en server.js
module.exports = connectDB;