const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * POST /api/auth/login
 * Login con email + password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const result = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.activo, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return error(res, 'Credenciales inválidas', 401);
    }

    const usuario = result.rows[0];

    // Verificar si usuario está activo
    if (!usuario.activo) {
      return error(res, 'Usuario inactivo. Contacte al administrador', 403);
    }

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return error(res, 'Credenciales inválidas', 401);
    }

    // Generar tokens
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Actualizar último acceso
    await query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [usuario.id]
    );

    log.success(`Login exitoso: ${usuario.email}`);

    // Retornar datos del usuario (sin password) y tokens
    return success(res, {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      },
      accessToken,
      refreshToken
    }, 'Login exitoso');

  } catch (err) {
    log.error('Error en login:', err);
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Renovar accessToken usando refreshToken
 */
const refresh = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Refresh token no proporcionado', 401);
    }

    const refreshToken = authHeader.split(' ')[1];

    // Verificar refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Verificar que el usuario aún existe y está activo
    const result = await query(
      `SELECT u.id, u.email, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1 AND u.activo = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return error(res, 'Usuario no válido', 401);
    }

    const usuario = result.rows[0];

    // Generar nuevo access token
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    const newAccessToken = generateAccessToken(payload);

    return success(res, {
      accessToken: newAccessToken
    }, 'Token renovado exitosamente');

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Refresh token expirado. Por favor inicie sesión nuevamente', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Refresh token inválido', 401);
    }
    log.error('Error en refresh:', err);
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
const me = async (req, res, next) => {
  try {
    // req.user ya fue poblado por el middleware verificarToken
    const result = await query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.activo, u.ultimo_acceso, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return error(res, 'Usuario no encontrado', 404);
    }

    return success(res, result.rows[0]);

  } catch (err) {
    log.error('Error en me:', err);
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Cerrar sesión (opcional: implementar blacklist de tokens)
 */
const logout = async (req, res, next) => {
  try {
    // Por ahora solo retornamos éxito
    // En producción podrías implementar una blacklist de tokens en Redis
    log.info(`Logout: usuario ${req.user.id}`);

    return success(res, null, 'Sesión cerrada exitosamente');

  } catch (err) {
    log.error('Error en logout:', err);
    next(err);
  }
};

module.exports = {
  login,
  refresh,
  me,
  logout
};
