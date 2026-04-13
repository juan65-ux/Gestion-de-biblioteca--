# 🏛️ Sistema de Gestión Biblioteca — Backend

API REST desarrollada como proyecto de pasantía en el SENA para digitalizar
los procesos internos de la biblioteca, eliminando el uso de formatos físicos.

## 📋 Descripción

El sistema permite gestionar:
- *Equipos* (computadores portátiles y video beams)
- *Préstamos* de equipos con control de disponibilidad automático
- *Reservas de sala* con validación de cruces de horario

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Entorno de ejecución |
| Express | 4.x | Framework del servidor |
| MongoDB | Atlas | Base de datos |
| Mongoose | 7.x | ODM para MongoDB |
| dotenv | - | Variables de entorno |
| cors | - | Control de acceso HTTP |
| nodemon | - | Desarrollo con recarga automática |

## 📁 Estructura del proyecto

biblioteca-backend/
├── src/
│   ├── config/
│   │   └── database.js        # Conexión a MongoDB
│   ├── models/
│   │   ├── Equipo.js          # Modelo de equipos
│   │   ├── Prestamo.js        # Modelo de préstamos
│   │   └── ReservaSala.js     # Modelo de reservas de sala
│   ├── controllers/
│   │   ├── equipoController.js
│   │   ├── prestamoController.js
│   │   └── reservaController.js
│   ├── routes/
│   │   ├── equipoRoutes.js
│   │   ├── prestamoRoutes.js
│   │   └── reservaRoutes.js
│   └── middlewares/
│       └── errorHandler.js    # Manejo global de errores
├── .env.example               # Plantilla de variables de entorno
├── .gitignore
├── app.js                     # Configuración de Express
├── server.js                  # Punto de entrada
└── package.json


## ⚙️ Instalación y configuración

### 1. Clonar el repositorio
bash
git clone https://github.com/juan65-ux/biblioteca-backend.git
cd biblioteca-backend


### 2. Instalar dependencias
bash
npm install


### 3. Configurar variables de entorno
bash
# Copia la plantilla
cp .env.example .env


Abre el archivo .env y configura tus valores:

PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster.mongodb.net/biblioteca_db
NODE_ENV=development


### 4. Ejecutar el servidor
bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start


Si todo está bien verás:

✅ MongoDB conectado: cluster0.xxxxx.mongodb.net
🚀 Servidor corriendo en http://localhost:3000


## 📡 Endpoints de la API

### 🔍 Health Check
| Método | URL | Descripción |
|---|---|---|
| GET | /api/health | Verificar estado del servidor |

### 💻 Equipos
| Método | URL | Descripción |
|---|---|---|
| POST | /api/equipos | Crear nuevo equipo |
| GET | /api/equipos | Listar todos los equipos |
| GET | /api/equipos?estado=disponible | Filtrar por estado |
| GET | /api/equipos?tipo=video_beam | Filtrar por tipo |
| GET | /api/equipos/:id | Obtener equipo por ID |
| PUT | /api/equipos/:id | Actualizar equipo |
| PATCH | /api/equipos/:id/estado | Cambiar estado del equipo |
| DELETE | /api/equipos/:id | Eliminar equipo |

### 📦 Préstamos
| Método | URL | Descripción |
|---|---|---|
| POST | /api/prestamos | Solicitar préstamo |
| GET | /api/prestamos/activos | Listar préstamos activos |
| GET | /api/prestamos/historial | Historial completo |
| GET | /api/prestamos/:id | Obtener préstamo por ID |
| PATCH | /api/prestamos/:id/finalizar | Finalizar préstamo |

### 📅 Reservas de Sala
| Método | URL | Descripción |
|---|---|---|
| POST | /api/reservas | Crear reserva |
| GET | /api/reservas | Listar todas las reservas |
| GET | /api/reservas?fecha=2024-06-15 | Filtrar por fecha |
| GET | /api/reservas/:id | Obtener reserva por ID |
| PATCH | /api/reservas/:id/cancelar | Cancelar reserva |

## 📝 Ejemplos de uso

### Crear un equipo
json
POST /api/equipos
{
    "nombre": "Portátil HP EliteBook",
    "tipo": "computador_portatil",
    "serial": "HP-2024-001",
    "descripcion": "Portátil negro, 16GB RAM"
}


### Solicitar un préstamo
json
POST /api/prestamos
{
    "nombreSolicitante": "Carlos Gómez",
    "cargoArea": "Docente de Sistemas",
    "equipoId": "ID_DEL_EQUIPO",
    "fechaInicio": "2024-06-15T08:00:00.000Z",
    "fechaFin": "2024-06-15T12:00:00.000Z",
    "observaciones": "Para clase de informática"
}


### Crear una reserva de sala
json
POST /api/reservas
{
    "nombreSolicitante": "Ana Torres",
    "fecha": "2024-06-15",
    "horaInicio": "09:00",
    "horaFin": "11:00",
    "motivo": "Reunión de coordinación académica"
}


## ✅ Validaciones implementadas

- No se puede prestar un equipo que no esté disponible
- Al finalizar un préstamo el equipo vuelve automáticamente a disponible
- No se puede eliminar un equipo que está prestado
- No se pueden crear reservas con cruces de horario
- Validación de formatos de fecha y hora
- Manejo global de errores con respuestas JSON consistentes

## 🔄 Flujo de un préstamo

1. Registrar equipo → estado: "disponible"
2. Solicitar préstamo → estado del equipo cambia a "prestado"
3. Intentar prestar el mismo equipo → ERROR (equipo no disponible)
4. Finalizar préstamo → estado del equipo vuelve a "disponible"
5. Consultar historial → registro completo de todos los préstamos


## 👨‍💻 Autor

*Juan Nicolás Montealegre Ramos*
Aprendiz SENA — Pasantía Biblioteca