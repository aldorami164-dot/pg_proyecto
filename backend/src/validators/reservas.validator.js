const Joi = require('joi');

// Esquema para crear reserva
const crearReservaSchema = Joi.object({
  // Huésped nuevo o existente (uno u otro, no ambos)
  huesped: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().max(100).allow('', null),
    dpi_pasaporte: Joi.string().max(50).allow('', null),
    email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
    telefono: Joi.string().max(20).allow('', null),
    pais: Joi.string().max(100).allow('', null),
    direccion: Joi.string().allow('', null),
    fecha_nacimiento: Joi.date().iso().allow(null)
  }),
  huesped_id: Joi.number().integer().positive(),

  // Datos de la reserva
  habitacion_id: Joi.number().integer().positive().required(),
  fecha_checkin: Joi.date().iso().required().messages({
    'date.base': 'La fecha de check-in es requerida'
  }),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required().messages({
    'date.greater': 'La fecha de check-out debe ser posterior al check-in'
  }),
  numero_huespedes: Joi.number().integer().positive().default(1),
  canal_reserva: Joi.string().valid('booking', 'whatsapp', 'facebook', 'telefono', 'presencial').required(),
  notas: Joi.string().max(500).allow('', null)
}).xor('huesped', 'huesped_id').messages({
  'object.xor': 'Debe proporcionar huesped (nuevo) o huesped_id (existente), no ambos'
});

// Esquema para actualizar reserva
const actualizarReservaSchema = Joi.object({
  fecha_checkin: Joi.date().iso().greater('now'),
  fecha_checkout: Joi.date().iso().when('fecha_checkin', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('fecha_checkin')),
    otherwise: Joi.date().iso()
  }),
  numero_huespedes: Joi.number().integer().positive(),
  notas: Joi.string().max(500).allow('', null)
}).min(1);

// Esquema para cambiar estado
const cambiarEstadoSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'confirmada', 'completada', 'cancelada').required()
});

// Esquema para query params de disponibilidad
const disponibilidadQuerySchema = Joi.object({
  fecha_checkin: Joi.date().iso().required(),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required(),
  tipo_habitacion_id: Joi.number().integer().positive()
});

// Esquema para query params de listado
const listarReservasQuerySchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'confirmada', 'completada', 'cancelada'),
  estados_excluir: Joi.string(), // Formato: "completada,cancelada"
  canal: Joi.string().valid('booking', 'whatsapp', 'facebook', 'telefono', 'presencial'),
  fecha_desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // Formato YYYY-MM-DD (sin hora para evitar problemas de timezone)
  fecha_hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // Formato YYYY-MM-DD (sin hora para evitar problemas de timezone)
  habitacion_id: Joi.number().integer().positive(),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(1000).default(20) // Aumentado a 1000 para el calendario
});

// Esquema para crear grupo de reservas (múltiples habitaciones)
const crearGrupoReservasSchema = Joi.object({
  // Huésped nuevo o existente (uno u otro, no ambos)
  huesped: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().max(100).allow('', null),
    dpi_pasaporte: Joi.string().max(50).allow('', null),
    email: Joi.string().email({ tlds: { allow: false } }).allow('', null),
    telefono: Joi.string().max(20).allow('', null),
    pais: Joi.string().max(100).allow('', null),
    direccion: Joi.string().allow('', null),
    fecha_nacimiento: Joi.date().iso().allow(null)
  }),
  huesped_id: Joi.number().integer().positive(),

  // Array de IDs de habitaciones (mínimo 2)
  habitaciones_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(2)
    .unique()
    .required()
    .messages({
      'array.min': 'Debe seleccionar al menos 2 habitaciones para crear un grupo',
      'array.unique': 'No puede reservar la misma habitación más de una vez'
    }),

  // Datos de la reserva
  fecha_checkin: Joi.date().iso().required().messages({
    'date.base': 'La fecha de check-in es requerida'
  }),
  fecha_checkout: Joi.date().iso().greater(Joi.ref('fecha_checkin')).required().messages({
    'date.greater': 'La fecha de check-out debe ser posterior al check-in'
  }),
  numero_huespedes: Joi.number().integer().positive().default(2),
  canal_reserva: Joi.string().valid('booking', 'whatsapp', 'facebook', 'telefono', 'presencial').default('presencial'),
  notas: Joi.string().max(500).allow('', null)
}).xor('huesped', 'huesped_id').messages({
  'object.xor': 'Debe proporcionar huesped (nuevo) o huesped_id (existente), no ambos'
});

module.exports = {
  crearReservaSchema,
  actualizarReservaSchema,
  cambiarEstadoSchema,
  disponibilidadQuerySchema,
  listarReservasQuerySchema,
  crearGrupoReservasSchema  // ← NUEVO VALIDADOR
};
