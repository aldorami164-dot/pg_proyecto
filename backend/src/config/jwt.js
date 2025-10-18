const jwt = require('jsonwebtoken');

/**
 * Genera un access token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {String} Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Genera un refresh token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @returns {String} Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Verifica un access token
 * @param {String} token - Token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verifica un refresh token
 * @param {String} token - Refresh token a verificar
 * @returns {Object} Payload decodificado
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
