const Joi = require('joi');

// =============================================================================
// VALIDATORS PARA SERVICIOS
// =============================================================================

/**
 * Schema para crear servicio
 */
const crearServicioSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  descripcion: Joi.string()
    .allow('', null)
    .max(1000)
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),

  categoria: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'La categoría es requerida',
      'string.min': 'La categoría debe tener al menos 2 caracteres',
      'string.max': 'La categoría no puede exceder 100 caracteres'
    }),

  precio: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .messages({
      'number.min': 'El precio no puede ser negativo'
    }),

  tiene_costo: Joi.boolean()
    .default(false),

  horario_inicio: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'El horario de inicio debe estar en formato HH:MM'
    }),

  horario_fin: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'El horario de fin debe estar en formato HH:MM'
    }),

  solicitable: Joi.boolean()
    .default(true),

  icono: Joi.string()
    .max(50)
    .default('CheckCircle')
    .messages({
      'string.max': 'El nombre del icono no puede exceder 50 caracteres'
    })
});

/**
 * Schema para actualizar servicio
 */
const actualizarServicioSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(255)
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),

  descripcion: Joi.string()
    .allow('', null)
    .max(1000)
    .messages({
      'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),

  categoria: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'La categoría debe tener al menos 2 caracteres',
      'string.max': 'La categoría no puede exceder 100 caracteres'
    }),

  precio: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .messages({
      'number.min': 'El precio no puede ser negativo'
    }),

  tiene_costo: Joi.boolean(),

  horario_inicio: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'El horario de inicio debe estar en formato HH:MM'
    }),

  horario_fin: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'El horario de fin debe estar en formato HH:MM'
    }),

  solicitable: Joi.boolean(),

  icono: Joi.string()
    .max(50)
    .messages({
      'string.max': 'El nombre del icono no puede exceder 50 caracteres'
    })
}).min(1);

/**
 * Schema para crear instrucción
 */
const crearInstruccionSchema = Joi.object({
  texto_instruccion: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.empty': 'El texto de la instrucción es requerido',
      'string.min': 'La instrucción debe tener al menos 3 caracteres',
      'string.max': 'La instrucción no puede exceder 500 caracteres'
    }),

  orden: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'El orden no puede ser negativo'
    })
});

/**
 * Schema para actualizar instrucción
 */
const actualizarInstruccionSchema = Joi.object({
  texto_instruccion: Joi.string()
    .min(3)
    .max(500)
    .messages({
      'string.min': 'La instrucción debe tener al menos 3 caracteres',
      'string.max': 'La instrucción no puede exceder 500 caracteres'
    }),

  orden: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.min': 'El orden no puede ser negativo'
    }),

  activo: Joi.boolean()
}).min(1);

module.exports = {
  crearServicioSchema,
  actualizarServicioSchema,
  crearInstruccionSchema,
  actualizarInstruccionSchema
};
