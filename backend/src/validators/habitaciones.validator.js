const Joi = require('joi');

// Esquema para crear habitación
const crearHabitacionSchema = Joi.object({
  numero: Joi.string().min(1).max(10).required(),
  tipo_habitacion_id: Joi.number().integer().positive().valid(1, 2, 3, 4).required().messages({
    'any.only': 'El tipo de habitación debe ser 1 (Individual), 2 (Doble), 3 (Triple) o 4 (Familiar)'
  }),
  precio_por_noche: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'El precio debe ser mayor a 0'
  }),
  descripcion: Joi.string().max(500).allow('', null)
});

// Esquema para actualizar habitación (solo admin puede cambiar precio)
const actualizarHabitacionSchema = Joi.object({
  precio_por_noche: Joi.number().positive().precision(2),
  descripcion: Joi.string().max(500).allow('', null)
}).min(1);

// Esquema para cambiar estado de habitación
const cambiarEstadoHabitacionSchema = Joi.object({
  estado: Joi.string().valid('disponible', 'limpieza', 'mantenimiento').required().messages({
    'any.only': 'El estado debe ser: disponible, limpieza o mantenimiento. El estado "ocupada" se maneja automáticamente'
  })
});

// Esquema para query params de listado
const listarHabitacionesQuerySchema = Joi.object({
  estado: Joi.string().valid('disponible', 'ocupada', 'limpieza', 'mantenimiento'),
  tipo_habitacion_id: Joi.number().integer().positive(),
  activo: Joi.boolean()
});

// Esquema para vincular imagen a habitación
const vincularImagenHabitacionSchema = Joi.object({
  imagen_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID de la imagen debe ser un número',
    'number.positive': 'El ID de la imagen debe ser mayor a 0',
    'any.required': 'El ID de la imagen es requerido'
  }),
  orden: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'El orden debe ser mayor o igual a 0'
  }),
  es_principal: Joi.boolean().default(false)
});

module.exports = {
  crearHabitacionSchema,
  actualizarHabitacionSchema,
  cambiarEstadoHabitacionSchema,
  listarHabitacionesQuerySchema,
  vincularImagenHabitacionSchema
};
