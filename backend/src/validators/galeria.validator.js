const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE GALERÍA
// =============================================================================

/**
 * Validar query params para listar imágenes
 */
const listarImagenesQuerySchema = Joi.object({
  categoria: Joi.string()
    .valid('hotel_exterior', 'habitaciones', 'servicios', 'restaurante', 'piscina', 'vistas')
    .optional()
    .messages({
      'string.base': 'La categoría debe ser texto',
      'any.only': 'La categoría debe ser una de: hotel_exterior, habitaciones, servicios, restaurante, piscina, vistas'
    }),
  activo: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Activo debe ser verdadero o falso'
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

/**
 * Validar body para actualizar imagen
 */
const actualizarImagenSchema = Joi.object({
  titulo: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.base': 'El título debe ser texto',
      'string.max': 'El título no puede exceder 255 caracteres'
    }),
  descripcion: Joi.string()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),
  categoria: Joi.string()
    .valid('hotel_exterior', 'habitaciones', 'servicios', 'restaurante', 'piscina', 'vistas')
    .optional()
    .messages({
      'string.base': 'La categoría debe ser texto',
      'any.only': 'La categoría debe ser una de: hotel_exterior, habitaciones, servicios, restaurante, piscina, vistas'
    }),
  orden: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'El orden debe ser un número',
      'number.integer': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0'
    })
}).min(1);

module.exports = {
  listarImagenesQuerySchema,
  actualizarImagenSchema
};
