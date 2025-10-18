const rateLimit = require('express-rate-limit');

// Rate limiter general para todas las rutas API
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde'
  },
  standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
});

// Rate limiter estricto para login (prevenir brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos de login
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intente después de 15 minutos'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
});

// Rate limiter para creación de registros (prevenir spam)
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 creaciones por minuto
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación. Por favor espere un momento'
  },
});

module.exports = {
  generalLimiter,
  loginLimiter,
  createLimiter
};
