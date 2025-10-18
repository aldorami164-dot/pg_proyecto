/**
 * Middleware para monitorear el estado del pool de conexiones
 * Ayuda a detectar problemas de conexiones antes de que fallen
 */

const { pool } = require('../config/database');
const log = require('../utils/logger');

// Estadísticas del pool
let statsInterval;

/**
 * Inicia el monitoreo del pool cada cierto intervalo
 */
const iniciarMonitoreo = (intervalo = 30000) => {
  // Loguear estado cada 30 segundos
  statsInterval = setInterval(() => {
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    };

    // Solo loguear si hay actividad o problemas potenciales
    if (stats.total > 0 || stats.waiting > 0) {
      log.info(`📊 Pool Stats - Total: ${stats.total}, Idle: ${stats.idle}, Waiting: ${stats.waiting}`);

      // Alerta si hay muchas conexiones esperando
      if (stats.waiting > 3) {
        log.warn(`⚠️  ALERTA: ${stats.waiting} conexiones esperando en el pool!`);
      }

      // Alerta si llegamos al límite del pool
      if (stats.total >= 10) {
        log.warn(`⚠️  ALERTA: Pool casi lleno (${stats.total}/10 conexiones)!`);
      }
    }
  }, intervalo);
};

/**
 * Detiene el monitoreo del pool
 */
const detenerMonitoreo = () => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
};

/**
 * Middleware que loguea las conexiones por request
 */
const logPoolStats = (req, res, next) => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };

  // Agregar stats al objeto request para debugging
  req.poolStats = stats;

  // Loguear solo si hay problemas potenciales
  if (stats.waiting > 0) {
    log.warn(`⚠️  [${req.method} ${req.path}] Conexiones esperando: ${stats.waiting}`);
  }

  next();
};

module.exports = {
  iniciarMonitoreo,
  detenerMonitoreo,
  logPoolStats
};
