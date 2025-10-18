const { query } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE NOTIFICACIONES
// =============================================================================

/**
 * GET /api/notificaciones
 * Listar notificaciones con filtros
 * @access Private (admin/recepcionista)
 */
const listarNotificaciones = async (req, res, next) => {
  try {
    const { leida, tipo, limit = 50 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (leida !== undefined) {
      whereClause += ` AND n.leida = $${paramCount}`;
      params.push(leida === 'true' || leida === true);
      paramCount++;
    }

    if (tipo) {
      whereClause += ` AND n.tipo = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    // Consulta de notificaciones
    const result = await query(
      `SELECT
        n.id,
        n.tipo,
        n.titulo,
        n.mensaje,
        n.prioridad,
        n.habitacion_numero,
        n.leida,
        n.creado_en,
        n.leida_por,
        u.nombre || ' ' || u.apellido as leida_por_nombre,
        n.fecha_lectura
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.leida_por = u.id
      ${whereClause}
      ORDER BY
        CASE WHEN n.leida = false THEN 0 ELSE 1 END,
        CASE WHEN n.prioridad = 'alta' THEN 0 ELSE 1 END,
        n.creado_en DESC
      LIMIT $${paramCount}`,
      [...params, limit]
    );

    // Contar notificaciones no leídas
    const noLeidasResult = await query(
      `SELECT COUNT(*) as total FROM notificaciones WHERE leida = false`
    );

    const no_leidas = parseInt(noLeidasResult.rows[0].total);

    log.success(`Listado de ${result.rows.length} notificaciones (${no_leidas} no leídas)`);

    return success(res, {
      notificaciones: result.rows,
      no_leidas
    });
  } catch (err) {
    log.error('Error al listar notificaciones:', err.message);
    next(err);
  }
};

/**
 * PATCH /api/notificaciones/:id/leer
 * Marcar notificación como leída
 * @access Private (admin/recepcionista)
 */
const marcarComoLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leida_por = req.user.id;

    // 1. Verificar que la notificación existe
    const notificacionResult = await query(
      `SELECT id, leida FROM notificaciones WHERE id = $1`,
      [id]
    );

    if (notificacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Notificación no encontrada' };
    }

    if (notificacionResult.rows[0].leida) {
      throw { statusCode: 400, message: 'La notificación ya fue leída' };
    }

    // 2. Marcar como leída
    const result = await query(
      `UPDATE notificaciones
       SET
         leida = true,
         leida_por = $1,
         fecha_lectura = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING
         id,
         tipo,
         titulo,
         mensaje,
         leida,
         leida_por,
         fecha_lectura`,
      [leida_por, id]
    );

    log.success(`Notificación ${id} marcada como leída por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Notificación marcada como leída');
  } catch (err) {
    log.error('Error al marcar notificación:', err.message);
    next(err);
  }
};

/**
 * PATCH /api/notificaciones/leer-todas
 * Marcar todas las notificaciones como leídas
 * @access Private (admin/recepcionista)
 */
const marcarTodasComoLeidas = async (req, res, next) => {
  try {
    const leida_por = req.user.id;

    const result = await query(
      `UPDATE notificaciones
       SET
         leida = true,
         leida_por = $1,
         fecha_lectura = CURRENT_TIMESTAMP
       WHERE leida = false
       RETURNING id`,
      [leida_por]
    );

    const cantidad = result.rows.length;

    log.success(`${cantidad} notificaciones marcadas como leídas por usuario ${req.user.email}`);

    return success(res, {
      notificaciones_actualizadas: cantidad
    }, `${cantidad} notificación(es) marcada(s) como leída(s)`);
  } catch (err) {
    log.error('Error al marcar todas las notificaciones:', err.message);
    next(err);
  }
};

/**
 * GET /api/notificaciones/:id
 * Obtener detalles de una notificación
 * @access Private (admin/recepcionista)
 */
const obtenerNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        n.id,
        n.tipo,
        n.titulo,
        n.mensaje,
        n.prioridad,
        n.habitacion_numero,
        n.leida,
        n.creado_en,
        n.leida_por,
        u.nombre || ' ' || u.apellido as leida_por_nombre,
        n.fecha_lectura
      FROM notificaciones n
      LEFT JOIN usuarios u ON n.leida_por = u.id
      WHERE n.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Notificación no encontrada' };
    }

    log.success(`Detalles de notificación ${id} obtenidos`);

    return success(res, result.rows[0]);
  } catch (err) {
    log.error('Error al obtener notificación:', err.message);
    next(err);
  }
};

module.exports = {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  obtenerNotificacion
};
