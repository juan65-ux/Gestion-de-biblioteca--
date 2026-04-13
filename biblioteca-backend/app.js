const express = require('express');
const cors = require('cors');

// Importamos las rutas
const equipoRoutes = require('./src/routes/equipoRoutes');
const prestamoRoutes = require('./src/routes/prestamoRoutes');
const reservaRoutes = require('./src/routes/reservaRoutes');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const registroPrestamoRoutes = require('./src/routes/registroPrestamoRoutes');

// Importamos el manejador de errores
const errorHandler = require('./src/middlewares/errorHandler');

// Creamos la aplicación Express
const app = express();

// ── MIDDLEWARES GLOBALES ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ── RUTA DE SALUD ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏛️ API Biblioteca funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ── RUTAS DE LA API ───────────────────────────────────────────────
app.use('/api/equipos', equipoRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/registros', registroPrestamoRoutes);

// ── RUTA NO ENCONTRADA ────────────────────────────────────────────
app.use('/{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `La ruta ${req.originalUrl} no existe en esta API`,
  });
});

// ── MANEJADOR DE ERRORES ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;