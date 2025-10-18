/**
 * Middleware para validar request body con esquemas Joi
 * @param {Object} schema - Esquema Joi de validación
 * @returns {Function} Middleware de Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: true // Remover campos no definidos en el schema
    });

    if (error) {
      error.isJoi = true; // Marcar como error de Joi para el errorHandler
      return next(error);
    }

    // Reemplazar req.body con el valor validado y sanitizado
    req.body = value;
    next();
  };
};

/**
 * Middleware para validar query params con esquemas Joi
 * @param {Object} schema - Esquema Joi de validación
 * @returns {Function} Middleware de Express
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware para validar params con esquemas Joi
 * @param {Object} schema - Esquema Joi de validación
 * @returns {Function} Middleware de Express
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams
};
