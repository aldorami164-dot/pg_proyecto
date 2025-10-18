const Joi = require('joi');

/**
 * Validación para actualizar huésped
 */
const actualizarHuespedSchema = Joi.object({
  nombre: Joi.string().min(1).max(100),
  apellido: Joi.string().allow('', null).max(100),
  dpi_pasaporte: Joi.string().allow('', null).max(50),
  email: Joi.string().email().allow('', null).max(255),
  telefono: Joi.string().allow('', null).max(20),
  pais: Joi.string().allow('', null).max(100),
  direccion: Joi.string().allow('', null),
  fecha_nacimiento: Joi.date().iso().allow(null)
}).min(1); // Al menos un campo debe estar presente

module.exports = {
  actualizarHuespedSchema
};
