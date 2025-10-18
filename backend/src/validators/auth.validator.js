const Joi = require('joi');

// Esquema para login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  })
});

// Esquema para crear usuario
const crearUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
  }),
  rol_id: Joi.number().integer().valid(1, 2).required().messages({
    'any.only': 'El rol debe ser 1 (administrador) o 2 (recepcionista)'
  })
});

// Esquema para actualizar usuario
const actualizarUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  apellido: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  rol_id: Joi.number().integer().valid(1, 2)
}).min(1); // Al menos un campo debe estar presente

module.exports = {
  loginSchema,
  crearUsuarioSchema,
  actualizarUsuarioSchema
};
