const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE NOTIFICACIONES
// =============================================================================

/**
 * Validar query params para listar notificaciones
 */
const listarNotificacionesQuerySchema = Joi.object({
  leida: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'El campo leída debe ser verdadero o falso'
    }),
  tipo: Joi.string()
    .valid('solicitud_servicio', 'alerta', 'informacion')
    .optional()
    .messages({
      'string.base': 'El tipo debe ser texto',
      'any.only': 'El tipo debe ser: solicitud_servicio, alerta o informacion'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .optional()
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite mínimo es 1',
      'number.max': 'El límite máximo es 100'
    })
});

module.exports = {
  listarNotificacionesQuerySchema
};
