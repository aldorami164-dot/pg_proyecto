const Joi = require('joi');

/**
 * Validación para crear lugar turístico
 */
const crearLugarSchema = Joi.object({
  nombre: Joi.string().min(3).max(255).required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  categoria: Joi.string().valid('cultura', 'naturaleza', 'gastronomia', 'aventura').required()
    .messages({
      'any.only': 'La categoría debe ser: cultura, naturaleza, gastronomia o aventura',
      'string.empty': 'La categoría es requerida'
    }),

  descripcion: Joi.string().allow('', null).optional(),

  ubicacion: Joi.string().max(255).allow('', null).optional(),

  url_maps: Joi.string().uri().allow('', null).optional()
    .messages({
      'string.uri': 'La URL de Google Maps debe ser una URL válida'
    }),

  telefono: Joi.string().max(20).allow('', null).optional(),

  horario: Joi.string().max(255).allow('', null).optional(),

  precio_entrada: Joi.number().min(0).optional().default(0)
    .messages({
      'number.min': 'El precio de entrada no puede ser negativo'
    }),

  orden: Joi.number().integer().min(0).optional().default(0)
    .messages({
      'number.min': 'El orden no puede ser negativo'
    })
});

/**
 * Validación para actualizar lugar turístico
 */
const actualizarLugarSchema = Joi.object({
  nombre: Joi.string().min(3).max(255).optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  categoria: Joi.string().valid('cultura', 'naturaleza', 'gastronomia', 'aventura').optional()
    .messages({
      'any.only': 'La categoría debe ser: cultura, naturaleza, gastronomia o aventura'
    }),

  descripcion: Joi.string().allow('', null).optional(),

  ubicacion: Joi.string().max(255).allow('', null).optional(),

  url_maps: Joi.string().uri().allow('', null).optional()
    .messages({
      'string.uri': 'La URL de Google Maps debe ser una URL válida'
    }),

  telefono: Joi.string().max(20).allow('', null).optional(),

  horario: Joi.string().max(255).allow('', null).optional(),

  precio_entrada: Joi.number().min(0).allow(null).optional()
    .messages({
      'number.min': 'El precio de entrada no puede ser negativo'
    }),

  orden: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'El orden no puede ser negativo'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

/**
 * Validación para vincular imagen a lugar turístico
 */
const vincularImagenSchema = Joi.object({
  imagen_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'imagen_id debe ser un número',
      'number.positive': 'imagen_id debe ser positivo',
      'any.required': 'imagen_id es requerido'
    }),

  orden: Joi.number().integer().min(0).optional().default(0)
    .messages({
      'number.min': 'El orden no puede ser negativo'
    }),

  es_principal: Joi.boolean().optional().default(false)
});

module.exports = {
  crearLugarSchema,
  actualizarLugarSchema,
  vincularImagenSchema
};
