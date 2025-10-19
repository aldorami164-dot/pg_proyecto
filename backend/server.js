require('dotenv').config();

// DEBUG: Verificar variables de entorno
console.log('\n🔧 DEBUG - Variables de entorno cargadas:');
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_PORT:', process.env.DB_PORT);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_SSL:', process.env.DB_SSL);
console.log('');

const app = require('./src/app');
const { pool } = require('./src/config/database');
const { iniciarWebSocketServer } = require('./src/websocket/notificaciones.ws');
const { iniciarMonitoreo, detenerMonitoreo } = require('./src/middleware/poolMonitor');
const log = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// =============================================================================
// VERIFICAR CONEXIÓN A BASE DE DATOS
// =============================================================================

pool.query('SELECT NOW() as now, current_database() as database', (err, res) => {
  if (err) {
    log.error('❌ Error al conectar a PostgreSQL:');
    log.error('   Mensaje:', err.message);
    log.error('   Código:', err.code);
    log.error('   Stack:', err.stack);
    log.error('');
    log.error('Verifica las credenciales y la configuración de red');
    process.exit(1);
  }

  log.success('✅ Conectado a PostgreSQL');
  log.info(`   Base de datos: ${res.rows[0].database}`);
  log.info(`   Timestamp: ${res.rows[0].now}`);
});

// =============================================================================
// INICIAR SERVIDOR HTTP
// =============================================================================

const server = app.listen(PORT, () => {
  log.success(`🚀 Servidor API escuchando en puerto ${PORT}`);
  log.info(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  log.info(`   URL: http://localhost:${PORT}`);
  log.info(`   Health check: http://localhost:${PORT}/health`);
  log.info('');
  log.info('📋 Rutas disponibles:');
  log.info('');
  log.info('   🔐 Autenticación:');
  log.info('   POST   /api/auth/login');
  log.info('   POST   /api/auth/refresh');
  log.info('   GET    /api/auth/me');
  log.info('   POST   /api/auth/logout');
  log.info('');
  log.info('   🛏️  Reservas:');
  log.info('   GET    /api/reservas');
  log.info('   POST   /api/reservas');
  log.info('   GET    /api/reservas/disponibilidad');
  log.info('   GET    /api/reservas/:id');
  log.info('   PUT    /api/reservas/:id');
  log.info('   PATCH  /api/reservas/:id/estado');
  log.info('');
  log.info('   🏠 Habitaciones:');
  log.info('   GET    /api/habitaciones');
  log.info('   POST   /api/habitaciones');
  log.info('   GET    /api/habitaciones/:id');
  log.info('   PUT    /api/habitaciones/:id');
  log.info('   PATCH  /api/habitaciones/:id/estado');
  log.info('   DELETE /api/habitaciones/:id');
  log.info('');
  log.info('   📱 Códigos QR:');
  log.info('   GET    /api/qr');
  log.info('   POST   /api/qr/generar');
  log.info('   PATCH  /api/qr/:id/asignar');
  log.info('   PATCH  /api/qr/:id/desasignar');
  log.info('   GET    /api/qr/:codigo/habitacion (público)');
  log.info('');
  log.info('   🛎️  Solicitudes de Servicio:');
  log.info('   GET    /api/solicitudes');
  log.info('   GET    /api/solicitudes/:id');
  log.info('   POST   /api/solicitudes (público)');
  log.info('   PATCH  /api/solicitudes/:id/completar');
  log.info('');
  log.info('   🔔 Notificaciones:');
  log.info('   GET    /api/notificaciones');
  log.info('   GET    /api/notificaciones/:id');
  log.info('   PATCH  /api/notificaciones/:id/leer');
  log.info('   PATCH  /api/notificaciones/leer-todas');
  log.info('');
  log.info('   👥 Usuarios:');
  log.info('   GET    /api/usuarios');
  log.info('   GET    /api/usuarios/:id');
  log.info('   POST   /api/usuarios');
  log.info('   PUT    /api/usuarios/:id');
  log.info('   PATCH  /api/usuarios/:id/toggle-activo');
  log.info('');
  log.info('   📊 Reportes:');
  log.info('   POST   /api/reportes/ocupacion');
  log.info('   GET    /api/reportes/ocupacion');
  log.info('   GET    /api/reportes/ocupacion/:id');
  log.info('');
  log.info('   🌐 Plataforma Pública:');
  log.info('   GET    /api/plataforma/contenido (público)');
  log.info('   GET    /api/plataforma/experiencias (público)');
  log.info('   GET    /api/plataforma/servicios (público)');
  log.info('   POST   /api/plataforma/comentarios (público)');
  log.info('   GET    /api/plataforma/comentarios (público)');
  log.info('');
  log.info('   🖼️  Galería:');
  log.info('   GET    /api/galeria (público)');
  log.info('   POST   /api/galeria (upload)');
  log.info('   PUT    /api/galeria/:id');
  log.info('   DELETE /api/galeria/:id');
  log.info('   PATCH  /api/galeria/:id/toggle-activo');
  log.info('');
});

// Iniciar servidor WebSocket solo en desarrollo
// En producción (Render), solo se permite un puerto
if (process.env.NODE_ENV !== 'production') {
  iniciarWebSocketServer(WS_PORT);
} else {
  log.info('🔔 WebSocket desactivado en producción (Render solo permite un puerto)');
}

// Iniciar monitoreo del pool solo en desarrollo
// En producción, Supabase Pooler maneja las conexiones automáticamente
if (process.env.NODE_ENV !== 'production') {
  iniciarMonitoreo(30000);
  log.info('📊 Monitoreo del pool de conexiones iniciado');
} else {
  log.info('📊 Monitoreo del pool desactivado en producción (Supabase Pooler lo maneja)');
}

// =============================================================================
// MANEJO DE SEÑALES DE CIERRE
// =============================================================================

const gracefulShutdown = (signal) => {
  log.info(`\n${signal} recibido, cerrando servidor...`);

  // Detener monitoreo del pool
  detenerMonitoreo();
  log.info('Monitoreo del pool detenido');

  server.close(() => {
    log.info('Servidor HTTP cerrado');

    pool.end(() => {
      log.info('Pool de PostgreSQL cerrado');
      log.success('Proceso terminado correctamente');
      process.exit(0);
    });
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    log.error('Forzando cierre del servidor...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = server;
