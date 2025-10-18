const Joi = require('joi');

// =============================================================================
// VALIDADORES PARA MÓDULO DE USUARIOS
// =============================================================================

/**
 * Validar creación de usuario
 */
const crearUsuarioSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.base': 'El apellido debe ser texto',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 100 caracteres',
      'any.required': 'El apellido es requerido'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.base': 'La contraseña debe ser texto',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La contraseña es requerida'
    }),
  rol_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El rol debe ser un número',
      'number.integer': 'El rol debe ser un número entero',
      'number.positive': 'El rol debe ser positivo',
      'any.required': 'El rol es requerido'
    })
});

/**
 * Validar actualización de usuario
 */
const actualizarUsuarioSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
  apellido: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.base': 'El apellido debe ser texto',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 100 caracteres'
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.base': 'El email debe ser texto',
      'string.email': 'El email debe ser válido'
    }),
  rol_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'El rol debe ser un número',
      'number.integer': 'El rol debe ser un número entero',
      'number.positive': 'El rol debe ser positivo'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional()
    .messages({
      'string.base': 'La contraseña debe ser texto',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    })
}).min(1); // Al menos un campo debe ser proporcionado

/**
 * Validar query params para listar usuarios
 */
const listarUsuariosQuerySchema = Joi.object({
  activo: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'El campo activo debe ser verdadero o falso'
    }),
  rol_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'El rol debe ser un número',
      'number.integer': 'El rol debe ser un número entero',
      'number.positive': 'El rol debe ser positivo'
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
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  listarUsuariosQuerySchema
};
