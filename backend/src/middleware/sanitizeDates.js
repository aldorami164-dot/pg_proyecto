/**
 * Middleware para sanitizar fechas en el body
 *
 * Problema: express.json() convierte strings ISO en Date objects
 * Solución: Convertir Date objects de vuelta a strings YYYY-MM-DD
 */

const log = require('../utils/logger');

const sanitizeDates = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const before = JSON.stringify(req.body);

    // Recursivamente buscar y convertir Date objects a strings
    req.body = sanitizeObject(req.body);

    const after = JSON.stringify(req.body);

    // Log SIEMPRE si hay body y es POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      log.info('🔄 sanitizeDates ejecutado en:', req.method, req.originalUrl || req.url);
      if (before !== after) {
        log.info('   ✅ Fechas convertidas de Date objects a strings');
      } else {
        log.info('   ℹ️  No se detectaron Date objects');
      }
    }
  }
  next();
};

function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si es un Date object, convertir a string YYYY-MM-DD
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0];
  }

  // Si es un array, sanitizar cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  // Si es un objeto, sanitizar cada propiedad
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  // Si es un string que parece fecha con timezone, convertirlo
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return obj.split('T')[0];
  }

  return obj;
}

module.exports = sanitizeDates;
