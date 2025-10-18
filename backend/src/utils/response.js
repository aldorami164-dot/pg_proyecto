/**
 * Respuesta exitosa estandarizada
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos a retornar
 * @param {String} message - Mensaje descriptivo
 * @param {Number} statusCode - Código HTTP
 */
const success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Respuesta de error estandarizada
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje de error
 * @param {Number} statusCode - Código HTTP
 * @param {Array|Object} errors - Detalles adicionales del error
 */
const error = (res, message = 'Error en el servidor', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  error
};
