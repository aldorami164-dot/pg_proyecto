const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA PLATAFORMA PÚBLICA (API SIN AUTENTICACIÓN)
// =============================================================================

/**
 * Validar query params para obtener contenido
 */
const obtenerContenidoQuerySchema = Joi.object({
  idioma: Joi.string()
    .valid('es', 'en')
    .default('es')
    .optional()
    .messages({
      'string.base': 'El idioma debe ser texto',
      'any.only': 'El idioma debe ser: es o en'
    })
});

/**
 * Validar query params para experiencias turísticas
 */
const obtenerExperienciasQuerySchema = Joi.object({
  categoria: Joi.string()
    .valid('atracciones', 'actividades', 'gastronomia', 'cultura')
    .optional()
    .messages({
      'string.base': 'La categoría debe ser texto',
      'any.only': 'La categoría debe ser: atracciones, actividades, gastronomia o cultura'
    }),
  destacado: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Destacado debe ser verdadero o falso'
    })
});

/**
 * Validar query params para comentarios
 */
const listarComentariosQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite mínimo es 1',
      'number.max': 'El límite máximo es 50'
    })
});

/**
 * Validar creación de comentario
 */
const crearComentarioSchema = Joi.object({
  nombre_huesped: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'El nombre del huésped debe ser texto',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 200 caracteres',
      'any.required': 'El nombre del huésped es requerido'
    }),
  comentario: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.base': 'El comentario debe ser texto',
      'string.min': 'El comentario debe tener al menos 10 caracteres',
      'string.max': 'El comentario no puede exceder 1000 caracteres',
      'any.required': 'El comentario es requerido'
    }),
  calificacion: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'La calificación debe ser un número',
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación mínima es 1',
      'number.max': 'La calificación máxima es 5',
      'any.required': 'La calificación es requerida'
    })
});

module.exports = {
  obtenerContenidoQuerySchema,
  obtenerExperienciasQuerySchema,
  listarComentariosQuerySchema,
  crearComentarioSchema
};
