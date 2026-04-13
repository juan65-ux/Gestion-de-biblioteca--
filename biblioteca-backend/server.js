require('dotenv').config();

const app = require('./app');
const connectDB = require('./src/config/database');
const { autoDevolverRegistrosActivos } = require('./src/controllers/registroPrestamoController');

const PORT = process.env.PORT || 3000;
const ZONA_HORARIA = 'America/Bogota';
let ultimaFechaEjecucionAutoDevolucion = null;

const HORA_CIERRE = 21;
const MINUTO_CIERRE = 30;
const CIERRE_TOTAL_MINUTOS = HORA_CIERRE * 60 + MINUTO_CIERRE;

const obtenerPartesFechaBogota = (fecha = new Date()) => {
  const formato = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    hour12: false,
  });

  const partes = formato.formatToParts(fecha);
  const mapa = {};
  for (const p of partes) {
    if (p.type !== 'literal') mapa[p.type] = p.value;
  }

  return {
    fechaISO: `${mapa.year}-${mapa.month}-${mapa.day}`,
    hora: Number(mapa.hour),
    minuto: Number(mapa.minute),
  };
};

const programarAutoDevolucion = () => {
  setInterval(async () => {
    try {
      const ahoraBogota = obtenerPartesFechaBogota();
      const yaPasoCierre =
        nowMinutosDesdeMedianoche(ahoraBogota) >= CIERRE_TOTAL_MINUTOS;

      // Ejecutar solo una vez por día, a partir de las 21:30
      if (yaPasoCierre && ultimaFechaEjecucionAutoDevolucion !== ahoraBogota.fechaISO) {
        const resultado = await autoDevolverRegistrosActivos();
        ultimaFechaEjecucionAutoDevolucion = ahoraBogota.fechaISO;

        console.log(
          `⏰ [AUTO-DEVOLUCION] ${ahoraBogota.fechaISO} ${ahoraBogota.hora}:${String(
            ahoraBogota.minuto
          ).padStart(2, '0')} - Registros cerrados: ${resultado.total}`
        );
      }
    } catch (error) {
      console.error('❌ [AUTO-DEVOLUCION] Error ejecutando cierre automático:', error.message);
    }
  }, 60 * 1000);
};

const nowMinutosDesdeMedianoche = ({ hora, minuto }) => {
  // Garantiza un cálculo estable incluso si vienen strings con padding.
  return Number(hora) * 60 + Number(minuto);
};

const iniciarServidor = async () => {
  await connectDB();

  // Ejecución inicial por si el servidor se reinicia estando ya después del cierre.
  // Así evitamos esperar a que el setInterval dispare en el siguiente minuto.
  try {
    const ahoraBogota = obtenerPartesFechaBogota();
    const yaPasoCierre =
      nowMinutosDesdeMedianoche(ahoraBogota) >= CIERRE_TOTAL_MINUTOS;

    if (yaPasoCierre && ultimaFechaEjecucionAutoDevolucion !== ahoraBogota.fechaISO) {
      const resultado = await autoDevolverRegistrosActivos();
      ultimaFechaEjecucionAutoDevolucion = ahoraBogota.fechaISO;
      console.log(
        `⏰ [AUTO-DEVOLUCION] ${ahoraBogota.fechaISO} ${ahoraBogota.hora}:${String(
          ahoraBogota.minuto
        ).padStart(2, '0')} - Registros cerrados: ${resultado.total}`
      );
    }
  } catch (error) {
    console.error(
      '❌ [AUTO-DEVOLUCION] Error en ejecución inicial del cierre automático:',
      error.message
    );
  }

  programarAutoDevolucion();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log('🕘 Auto-devolución activa: diario desde las 21:30 (America/Bogota)');
  });
};

iniciarServidor();