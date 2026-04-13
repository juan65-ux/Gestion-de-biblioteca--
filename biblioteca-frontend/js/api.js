// ── CONFIGURACIÓN BASE ─────────────────────────────────────────
const API_URL = 'http://localhost:3000/api';

// ── CIERRE AUTOMÁTICO DE SESIÓN POR INACTIVIDAD (30 min) ───────
const TIEMPO_INACTIVIDAD_MS = 30 * 60 * 1000; // 30 minutos
let temporizadorSesion = null;

const cerrarSesionPorInactividad = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
  const enSubcarpeta = window.location.pathname.includes('/usuario/');
  const loginUrl = enSubcarpeta ? '../login.html' : 'login.html';
  alert('Tu sesión se cerró por inactividad (30 minutos). Por favor inicia sesión nuevamente.');
  window.location.href = loginUrl;
};

const reiniciarTemporizador = () => {
  clearTimeout(temporizadorSesion);
  // Solo activar si hay una sesión activa
  if (sessionStorage.getItem('token')) {
    temporizadorSesion = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
  }
};

// Escuchar eventos de actividad del usuario
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evento => {
  document.addEventListener(evento, reiniciarTemporizador, { passive: true });
});

// Iniciar el temporizador al cargar la página
reiniciarTemporizador();

// ── FUNCIÓN BASE DE PETICIONES ─────────────────────────────────
const peticion = async (endpoint, metodo = 'GET', cuerpo = null) => {
  try {
    const opciones = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (cuerpo) {
      opciones.body = JSON.stringify(cuerpo);
    }

    // ✅ Corregido: backtick en lugar de comilla simple
    const respuesta = await fetch(`${API_URL}${endpoint}`, opciones);

    // Si el servidor responde 401, la sesión expiró → redirigir al login
    if (respuesta.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      // Detectamos si estamos en subcarpeta /usuario/
      const enSubcarpeta = window.location.pathname.includes('/usuario/');
      window.location.href = enSubcarpeta ? '../login.html' : 'login.html';
      return;
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.message || 'Error en la petición');
    }

    return datos;
  } catch (error) {
    throw error;
  }
};

// ── API DE EQUIPOS ─────────────────────────────────────────────
const equiposAPI = {
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    // ✅ Corregido: backticks en todos los template literals
    return peticion(`/equipos${params ? '?' + params : ''}`);
  },
  crear: (datos) => peticion('/equipos', 'POST', datos),
  obtener: (id) => peticion(`/equipos/${id}`),
  actualizar: (id, datos) => peticion(`/equipos/${id}`, 'PUT', datos),
  cambiarEstado: (id, estado) => peticion(`/equipos/${id}/estado`, 'PATCH', { estado }),
  eliminar: (id) => peticion(`/equipos/${id}`, 'DELETE'),
};

// ── API DE PRÉSTAMOS ───────────────────────────────────────────
const prestamosAPI = {
  solicitar: (datos) => peticion('/prestamos', 'POST', datos),
  activos: () => peticion('/prestamos/activos'),
  historial: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return peticion(`/prestamos/historial${params ? '?' + params : ''}`);
  },
  obtener: (id) => peticion(`/prestamos/${id}`),
  finalizar: (id) => peticion(`/prestamos/${id}/finalizar`, 'PATCH'),
};

// ── API DE RESERVAS ────────────────────────────────────────────
const reservasAPI = {
  crear: (datos) => peticion('/reservas', 'POST', datos),
  listar: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString();
    return peticion(`/reservas${params ? '?' + params : ''}`);
  },
  obtener: (id) => peticion(`/reservas/${id}`),
  cancelar: (id) => peticion(`/reservas/${id}/cancelar`, 'PATCH'),
};

// ── FUNCIONES UTILITARIAS ──────────────────────────────────────
const mostrarNotificacion = (mensaje, tipo = 'exito') => {
  const anterior = document.querySelector('.notificacion');
  if (anterior) anterior.remove();

  const iconos = {
    exito: '✅',
    error: '❌',
    advertencia: '⚠️',
  };

  const notif = document.createElement('div');
  // ✅ Corregido: backtick para el string de clase con interpolación
  notif.className = `notificacion notificacion-${tipo}`;
  notif.innerHTML = `
    <span>${iconos[tipo]}</span>
    <span>${mensaje}</span>
  `;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return '—';
  return new Date(fechaISO).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatearFechaHora = (fechaISO) => {
  if (!fechaISO) return '—';
  return new Date(fechaISO).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ✅ Corregido: backtick para el template literal del badge
const badgeEstado = (estado) => {
  return `<span class="badge-${estado}">${estado}</span>`;
};