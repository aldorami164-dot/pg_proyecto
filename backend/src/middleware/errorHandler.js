const log = require('../utils/logger');

/**
 * Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Loguear error
  log.error('Error capturado:', err);

  // Error de validación Joi
  if (err.isJoi) {
    // Log detallado de errores de validación para debugging
    log.error('❌ Error de validación Joi:');
    err.details.forEach(d => {
      log.error(`   Campo: ${d.path.join('.')} - ${d.message}`);
    });

    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  // Errores de PostgreSQL
  if (err.code) {
    // Violación de unique constraint
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'El registro ya existe',
        error: err.detail
      });
    }

    // Violación de foreign key
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida. El registro relacionado no existe',
        error: err.detail
      });
    }

    // Violación de CHECK constraint
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        message: 'Valor no permitido',
        error: err.detail
      });
    }

    // Violación de NOT NULL
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Campo requerido faltante',
        error: err.detail
      });
    }
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Error en la petición'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
