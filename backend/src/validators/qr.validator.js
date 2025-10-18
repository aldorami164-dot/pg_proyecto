const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE CÓDIGOS QR
// =============================================================================

/**
 * Validar generación de QR
 */
const generarQrSchema = Joi.object({
  cantidad: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.base': 'La cantidad debe ser un número',
      'number.integer': 'La cantidad debe ser un número entero',
      'number.min': 'La cantidad mínima es 1',
      'number.max': 'La cantidad máxima es 100',
      'any.required': 'La cantidad es requerida'
    })
});

/**
 * Validar asignación de QR a habitación
 */
const asignarQrSchema = Joi.object({
  habitacion_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de habitación debe ser un número',
      'number.integer': 'El ID de habitación debe ser un número entero',
      'number.positive': 'El ID de habitación debe ser positivo',
      'any.required': 'El ID de habitación es requerido'
    })
});

/**
 * Validar query params para listar QR
 */
const listarQrQuerySchema = Joi.object({
  estado: Joi.string()
    .valid('sin_asignar', 'asignado', 'inactivo')
    .optional()
    .messages({
      'string.base': 'El estado debe ser texto',
      'any.only': 'El estado debe ser: sin_asignar, asignado o inactivo'
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
    .default(50)
    .optional()
});

module.exports = {
  generarQrSchema,
  asignarQrSchema,
  listarQrQuerySchema
};
