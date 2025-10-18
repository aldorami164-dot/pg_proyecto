const { verifyAccessToken } = require('../config/jwt');
const { query } = require('../config/database');
const { error } = require('../utils/response');

/**
 * Middleware para verificar JWT y autenticar usuario
 */
const verificarToken = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar token
    const decoded = verifyAccessToken(token);

    // Verificar que el usuario existe y está activo
    const result = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1 AND u.activo = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return error(res, 'Usuario no válido o inactivo', 401);
    }

    // Adjuntar usuario al request para usarlo en los controladores
    req.user = result.rows[0];
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expirado', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Token inválido', 401);
    }
    return error(res, 'Error al verificar autenticación', 500);
  }
};

/**
 * Middleware para verificar que el usuario es administrador
 */
const esAdmin = (req, res, next) => {
  if (!req.user) {
    return error(res, 'Usuario no autenticado', 401);
  }

  if (req.user.rol !== 'administrador') {
    return error(res, 'Acceso denegado. Requiere rol de administrador', 403);
  }

  next();
};

/**
 * Middleware para verificar que el usuario es admin o recepcionista
 */
const esPersonal = (req, res, next) => {
  if (!req.user) {
    return error(res, 'Usuario no autenticado', 401);
  }

  const rolesPermitidos = ['administrador', 'recepcionista'];
  if (!rolesPermitidos.includes(req.user.rol)) {
    return error(res, 'Acceso denegado. Requiere permisos de personal', 403);
  }

  next();
};

module.exports = {
  verificarToken,
  esAdmin,
  esPersonal
};
