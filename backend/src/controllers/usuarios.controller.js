const bcrypt = require('bcrypt');
const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE USUARIOS
// =============================================================================

/**
 * GET /api/usuarios
 * Listar usuarios con filtros
 * @access Private (SOLO admin)
 */
const listarUsuarios = async (req, res, next) => {
  try {
    const { activo, rol_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (activo !== undefined) {
      whereClause += ` AND u.activo = $${paramCount}`;
      params.push(activo === 'true' || activo === true);
      paramCount++;
    }

    if (rol_id) {
      whereClause += ` AND u.rol_id = $${paramCount}`;
      params.push(rol_id);
      paramCount++;
    }

    // Consulta con paginación
    const result = await query(
      `SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol_id,
        r.nombre as rol,
        u.activo,
        u.ultimo_acceso,
        u.creado_en
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      ${whereClause}
      ORDER BY u.creado_en DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Contar total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM usuarios u ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    log.success(`Listado de ${result.rows.length} usuarios`);

    return success(res, {
      usuarios: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (err) {
    log.error('Error al listar usuarios:', err.message);
    next(err);
  }
};

/**
 * GET /api/usuarios/:id
 * Obtener detalles de un usuario
 * @access Private (SOLO admin)
 */
const obtenerUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol_id,
        r.nombre as rol,
        u.activo,
        u.ultimo_acceso,
        u.creado_en
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }

    log.success(`Detalles de usuario ${id} obtenidos`);

    return success(res, result.rows[0]);
  } catch (err) {
    log.error('Error al obtener usuario:', err.message);
    next(err);
  }
};

/**
 * POST /api/usuarios
 * Crear nuevo usuario
 * @access Private (SOLO admin)
 */
const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, rol_id } = req.body;

    // 1. Verificar que el email no esté registrado
    const emailExiste = await query(
      `SELECT id FROM usuarios WHERE email = $1`,
      [email]
    );

    if (emailExiste.rows.length > 0) {
      throw {
        statusCode: 409,
        message: 'El email ya está registrado'
      };
    }

    // 2. Verificar que el rol existe
    const rolExiste = await query(
      `SELECT id, nombre FROM roles WHERE id = $1`,
      [rol_id]
    );

    if (rolExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Rol no encontrado' };
    }

    // 3. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario
    const result = await query(
      `INSERT INTO usuarios
        (nombre, apellido, email, password_hash, rol_id, activo)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING
        id,
        nombre,
        apellido,
        email,
        rol_id,
        activo,
        creado_en`,
      [nombre, apellido, email, hashedPassword, rol_id]
    );

    const usuario = {
      ...result.rows[0],
      rol: rolExiste.rows[0].nombre
    };

    log.success(`Usuario creado: ${email} (${rolExiste.rows[0].nombre}) por ${req.user.email}`);

    return success(res, usuario, 'Usuario creado exitosamente', 201);
  } catch (err) {
    log.error('Error al crear usuario:', err.message);
    next(err);
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario
 * @access Private (SOLO admin)
 */
const actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, rol_id, password } = req.body;

    // 1. Verificar que el usuario existe
    const usuarioExiste = await query(
      `SELECT id FROM usuarios WHERE id = $1`,
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }

    // 2. Si se está cambiando el email, verificar que no esté en uso
    if (email) {
      const emailEnUso = await query(
        `SELECT id FROM usuarios WHERE email = $1 AND id != $2`,
        [email, id]
      );

      if (emailEnUso.rows.length > 0) {
        throw {
          statusCode: 409,
          message: 'El email ya está en uso por otro usuario'
        };
      }
    }

    // 3. Si se está cambiando el rol, verificar que existe
    if (rol_id) {
      const rolExiste = await query(
        `SELECT id FROM roles WHERE id = $1`,
        [rol_id]
      );

      if (rolExiste.rows.length === 0) {
        throw { statusCode: 404, message: 'Rol no encontrado' };
      }
    }

    // 4. Construir query de actualización dinámica
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (nombre) {
      updates.push(`nombre = $${paramCount}`);
      params.push(nombre);
      paramCount++;
    }

    if (apellido) {
      updates.push(`apellido = $${paramCount}`);
      params.push(apellido);
      paramCount++;
    }

    if (email) {
      updates.push(`email = $${paramCount}`);
      params.push(email);
      paramCount++;
    }

    if (rol_id) {
      updates.push(`rol_id = $${paramCount}`);
      params.push(rol_id);
      paramCount++;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount}`);
      params.push(hashedPassword);
      paramCount++;
    }

    if (updates.length === 0) {
      throw { statusCode: 400, message: 'No se proporcionaron campos para actualizar' };
    }

    params.push(id);

    // 5. Actualizar usuario
    const result = await query(
      `UPDATE usuarios
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         nombre,
         apellido,
         email,
         rol_id,
         activo`,
      params
    );

    // Obtener nombre del rol
    const rolResult = await query(
      `SELECT nombre FROM roles WHERE id = $1`,
      [result.rows[0].rol_id]
    );

    const usuario = {
      ...result.rows[0],
      rol: rolResult.rows[0].nombre
    };

    log.success(`Usuario ${id} actualizado por ${req.user.email}`);

    return success(res, usuario, 'Usuario actualizado exitosamente');
  } catch (err) {
    log.error('Error al actualizar usuario:', err.message);
    next(err);
  }
};

/**
 * PATCH /api/usuarios/:id/toggle-activo
 * Activar/desactivar usuario (soft delete)
 * @access Private (SOLO admin)
 */
const toggleActivo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verificar que el usuario existe
    const usuarioResult = await query(
      `SELECT id, activo, email FROM usuarios WHERE id = $1`,
      [id]
    );

    if (usuarioResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }

    const usuario = usuarioResult.rows[0];

    // 2. No permitir que el admin se desactive a sí mismo
    if (parseInt(id) === req.user.id) {
      throw {
        statusCode: 400,
        message: 'No puedes desactivar tu propia cuenta'
      };
    }

    // 3. Alternar estado activo
    const nuevoEstado = !usuario.activo;

    const result = await query(
      `UPDATE usuarios
       SET activo = $1
       WHERE id = $2
       RETURNING id, nombre, apellido, email, activo`,
      [nuevoEstado, id]
    );

    log.success(
      `Usuario ${usuario.email} ${nuevoEstado ? 'activado' : 'desactivado'} por ${req.user.email}`
    );

    return success(
      res,
      result.rows[0],
      `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`
    );
  } catch (err) {
    log.error('Error al cambiar estado de usuario:', err.message);
    next(err);
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  toggleActivo
};
