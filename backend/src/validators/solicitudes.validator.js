const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE SOLICITUDES DE SERVICIO
// =============================================================================

/**
 * Validar creación de solicitud de servicio (desde plataforma QR)
 */
const crearSolicitudSchema = Joi.object({
  habitacion_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de habitación debe ser un número',
      'number.integer': 'El ID de habitación debe ser un número entero',
      'number.positive': 'El ID de habitación debe ser positivo',
      'any.required': 'El ID de habitación es requerido'
    }),
  servicio_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de servicio debe ser un número',
      'number.integer': 'El ID de servicio debe ser un número entero',
      'number.positive': 'El ID de servicio debe ser positivo',
      'any.required': 'El ID de servicio es requerido'
    }),
  origen: Joi.string()
    .valid('plataforma_qr', 'recepcion')
    .default('plataforma_qr')
    .messages({
      'string.base': 'El origen debe ser texto',
      'any.only': 'El origen debe ser: plataforma_qr o recepcion'
    }),
  notas: Joi.string()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Las notas no pueden exceder 500 caracteres'
    })
});

/**
 * Validar query params para listar solicitudes
 */
const listarSolicitudesQuerySchema = Joi.object({
  estado: Joi.string()
    .valid('pendiente', 'completada')
    .optional()
    .messages({
      'string.base': 'El estado debe ser texto',
      'any.only': 'El estado debe ser: pendiente o completada'
    }),
  habitacion_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'El ID de habitación debe ser un número',
      'number.integer': 'El ID de habitación debe ser un número entero',
      'number.positive': 'El ID de habitación debe ser positivo'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
});

module.exports = {
  crearSolicitudSchema,
  listarSolicitudesQuerySchema
};
