const Joi = require('joi');

/**
 * Validación para crear experiencia turística
 */
const crearExperienciaSchema = Joi.object({
  nombre: Joi.string().min(3).max(255).required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  categoria: Joi.string().valid('aventura', 'cultura', 'naturaleza', 'gastronomia').required()
    .messages({
      'any.only': 'La categoría debe ser: aventura, cultura, naturaleza o gastronomia',
      'string.empty': 'La categoría es requerida'
    }),

  descripcion: Joi.string().allow('', null).optional(),

  ubicacion: Joi.string().max(500).allow('', null).optional(),

  duracion: Joi.string().max(100).allow('', null).optional()
    .messages({
      'string.max': 'La duración no puede exceder 100 caracteres'
    }),

  capacidad: Joi.number().integer().min(1).allow(null).optional()
    .messages({
      'number.min': 'La capacidad debe ser al menos 1 persona'
    }),

  destacado: Joi.boolean().optional(),

  orden: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'El orden no puede ser negativo'
    })
});

/**
 * Validación para actualizar experiencia turística
 */
const actualizarExperienciaSchema = Joi.object({
  nombre: Joi.string().min(3).max(255).optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  categoria: Joi.string().valid('aventura', 'cultura', 'naturaleza', 'gastronomia').optional()
    .messages({
      'any.only': 'La categoría debe ser: aventura, cultura, naturaleza o gastronomia'
    }),

  descripcion: Joi.string().allow('', null).optional(),

  ubicacion: Joi.string().max(500).allow('', null).optional(),

  duracion: Joi.string().max(100).allow('', null).optional(),

  capacidad: Joi.number().integer().min(1).allow(null).optional()
    .messages({
      'number.min': 'La capacidad debe ser al menos 1 persona'
    }),

  destacado: Joi.boolean().optional(),

  orden: Joi.number().integer().min(0).optional()
    .messages({
      'number.min': 'El orden no puede ser negativo'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

/**
 * Validación para vincular imagen a experiencia
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
  crearExperienciaSchema,
  actualizarExperienciaSchema,
  vincularImagenSchema
};
