const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE REPORTES
// =============================================================================

/**
 * Validar generación de reporte de ocupación
 */
const generarReporteSchema = Joi.object({
  fecha_inicio: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'date.format': 'La fecha de inicio debe estar en formato ISO (YYYY-MM-DD)',
      'any.required': 'La fecha de inicio es requerida'
    }),
  fecha_fin: Joi.date()
    .iso()
    .greater(Joi.ref('fecha_inicio'))
    .required()
    .messages({
      'date.base': 'La fecha de fin debe ser una fecha válida',
      'date.format': 'La fecha de fin debe estar en formato ISO (YYYY-MM-DD)',
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
      'any.required': 'La fecha de fin es requerida'
    }),
  tipo_periodo: Joi.string()
    .valid('semanal', 'mensual')
    .required()
    .messages({
      'string.base': 'El tipo de período debe ser texto',
      'any.only': 'El tipo de período debe ser: semanal o mensual',
      'any.required': 'El tipo de período es requerido'
    })
});

/**
 * Validar query params para listar reportes
 */
const listarReportesQuerySchema = Joi.object({
  tipo_periodo: Joi.string()
    .valid('semanal', 'mensual')
    .optional()
    .messages({
      'string.base': 'El tipo de período debe ser texto',
      'any.only': 'El tipo de período debe ser: semanal o mensual'
    }),
  fecha_desde: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'La fecha desde debe ser una fecha válida',
      'date.format': 'La fecha desde debe estar en formato ISO (YYYY-MM-DD)'
    }),
  fecha_hasta: Joi.date()
    .iso()
    .greater(Joi.ref('fecha_desde'))
    .optional()
    .messages({
      'date.base': 'La fecha hasta debe ser una fecha válida',
      'date.format': 'La fecha hasta debe estar en formato ISO (YYYY-MM-DD)',
      'date.greater': 'La fecha hasta debe ser posterior a la fecha desde'
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
  generarReporteSchema,
  listarReportesQuerySchema
};
