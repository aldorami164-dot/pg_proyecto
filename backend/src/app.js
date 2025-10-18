const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');
const sanitizeDates = require('./middleware/sanitizeDates');
const log = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const reservasRoutes = require('./routes/reservas.routes');
const habitacionesRoutes = require('./routes/habitaciones.routes');
const huespedesRoutes = require('./routes/huespedes.routes');
const qrRoutes = require('./routes/qr.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const reportesRoutes = require('./routes/reportes.routes');
const plataformaRoutes = require('./routes/plataforma.routes');
const galeriaRoutes = require('./routes/galeria.routes');
const experienciasRoutes = require('./routes/experiencias.routes');
const lugaresTuristicosRoutes = require('./routes/lugaresTuristicos.routes');

const app = express();

// =============================================================================
// MIDDLEWARE DE SEGURIDAD
// =============================================================================

// Helmet: Headers de seguridad HTTP
app.use(helmet());

// CORS: Permitir solicitudes desde frontend
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (como herramientas de testing, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      log.warn(`CORS bloqueado para origen: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// =============================================================================
// MIDDLEWARE GENERAL
// =============================================================================

// Morgan: Logger de peticiones HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// FIX CRÍTICO: Sanitizar Date objects que express.json() crea automáticamente
// DEBE ir DESPUÉS de express.json()
app.use(sanitizeDates);

// Cookie parser
app.use(cookieParser());

// Rate limiting general (aplicar a todas las rutas /api)
app.use('/api', generalLimiter);

// =============================================================================
// RUTAS
// =============================================================================

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/huespedes', huespedesRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/plataforma', plataformaRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/experiencias', experienciasRoutes);
app.use('/api/lugares-turisticos', lugaresTuristicosRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// =============================================================================
// MANEJO DE ERRORES
// =============================================================================

// Middleware global de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
