const { query, getClient } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE SOLICITUDES DE SERVICIO
// =============================================================================

/**
 * GET /api/solicitudes
 * Listar solicitudes de servicio con filtros
 * @access Private (admin/recepcionista)
 */
const listarSolicitudes = async (req, res, next) => {
  try {
    const { estado, habitacion_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (estado) {
      whereClause += ` AND ss.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (habitacion_id) {
      whereClause += ` AND ss.habitacion_id = $${paramCount}`;
      params.push(habitacion_id);
      paramCount++;
    }

    // Consulta con paginación (con conversión a zona horaria de Guatemala UTC-6)
    const result = await query(
      `SELECT
        ss.id,
        ss.habitacion_id,
        h.numero as habitacion_numero,
        ss.servicio_id,
        s.nombre as servicio_nombre,
        s.categoria as servicio_categoria,
        s.precio as servicio_precio,
        s.tiene_costo,
        ss.origen,
        ss.estado,
        ss.notas,
        (ss.creado_en AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as creado_en,
        ss.atendido_por,
        u.nombre || ' ' || u.apellido as atendido_por_nombre,
        (ss.fecha_atencion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as fecha_atencion
      FROM solicitudes_servicios ss
      INNER JOIN habitaciones h ON ss.habitacion_id = h.id
      INNER JOIN servicios s ON ss.servicio_id = s.id
      LEFT JOIN usuarios u ON ss.atendido_por = u.id
      ${whereClause}
      ORDER BY
        CASE WHEN ss.estado = 'pendiente' THEN 0 ELSE 1 END,
        ss.creado_en DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Contar total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM solicitudes_servicios ss ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    log.success(`Listado de ${result.rows.length} solicitudes de servicio`);

    return success(res, {
      solicitudes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (err) {
    log.error('Error al listar solicitudes:', err.message);
    next(err);
  }
};

/**
 * POST /api/solicitudes
 * Crear solicitud de servicio (PÚBLICO - desde plataforma QR)
 * @access Public
 */
const crearSolicitud = async (req, res, next) => {
  try {
    const { habitacion_id, servicio_id, origen = 'plataforma_qr', notas } = req.body;

    // 1. Verificar que la habitación existe y está activa
    const habitacionResult = await query(
      `SELECT id, numero, activo FROM habitaciones WHERE id = $1`,
      [habitacion_id]
    );

    if (habitacionResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Habitación no encontrada' };
    }

    if (!habitacionResult.rows[0].activo) {
      throw { statusCode: 400, message: 'La habitación no está activa' };
    }

    // 2. Verificar que el servicio existe y está activo
    const servicioResult = await query(
      `SELECT id, nombre, activo FROM servicios WHERE id = $1`,
      [servicio_id]
    );

    if (servicioResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Servicio no encontrado' };
    }

    if (!servicioResult.rows[0].activo) {
      throw { statusCode: 400, message: 'El servicio no está disponible' };
    }

    // 3. Crear solicitud
    const result = await query(
      `INSERT INTO solicitudes_servicios
        (habitacion_id, servicio_id, origen, notas, estado)
      VALUES ($1, $2, $3, $4, 'pendiente')
      RETURNING
        id,
        habitacion_id,
        servicio_id,
        origen,
        estado,
        notas,
        (creado_en AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as creado_en`,
      [habitacion_id, servicio_id, origen, notas]
    );

    const solicitud = result.rows[0];

    // 4. El trigger automático creará la notificación

    log.success(
      `Solicitud de servicio creada - Habitación ${habitacionResult.rows[0].numero} - Servicio: ${servicioResult.rows[0].nombre}`
    );

    return success(
      res,
      {
        ...solicitud,
        habitacion_numero: habitacionResult.rows[0].numero,
        servicio_nombre: servicioResult.rows[0].nombre
      },
      'Solicitud de servicio creada exitosamente',
      201
    );
  } catch (err) {
    log.error('Error al crear solicitud:', err.message);
    next(err);
  }
};

/**
 * PATCH /api/solicitudes/:id/completar
 * Marcar solicitud como completada
 * @access Private (admin/recepcionista)
 */
const completarSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const atendido_por = req.user.id;

    // 1. Verificar que la solicitud existe
    const solicitudResult = await query(
      `SELECT id, estado FROM solicitudes_servicios WHERE id = $1`,
      [id]
    );

    if (solicitudResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Solicitud no encontrada' };
    }

    if (solicitudResult.rows[0].estado === 'completada') {
      throw { statusCode: 400, message: 'La solicitud ya fue completada' };
    }

    // 2. Actualizar estado
    const result = await query(
      `UPDATE solicitudes_servicios
       SET
         estado = 'completada',
         atendido_por = $1,
         fecha_atencion = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING
         id,
         habitacion_id,
         servicio_id,
         estado,
         atendido_por,
         (fecha_atencion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as fecha_atencion`,
      [atendido_por, id]
    );

    log.success(`Solicitud ${id} marcada como completada por usuario ${req.user.email}`);

    return success(res, result.rows[0], 'Solicitud marcada como completada');
  } catch (err) {
    log.error('Error al completar solicitud:', err.message);
    next(err);
  }
};

/**
 * GET /api/solicitudes/:id
 * Obtener detalles de una solicitud
 * @access Private (admin/recepcionista)
 */
const obtenerSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        ss.id,
        ss.habitacion_id,
        h.numero as habitacion_numero,
        ss.servicio_id,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion,
        s.categoria as servicio_categoria,
        s.precio as servicio_precio,
        s.tiene_costo,
        ss.origen,
        ss.estado,
        ss.notas,
        (ss.creado_en AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as creado_en,
        ss.atendido_por,
        u.nombre || ' ' || u.apellido as atendido_por_nombre,
        (ss.fecha_atencion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') as fecha_atencion
      FROM solicitudes_servicios ss
      INNER JOIN habitaciones h ON ss.habitacion_id = h.id
      INNER JOIN servicios s ON ss.servicio_id = s.id
      LEFT JOIN usuarios u ON ss.atendido_por = u.id
      WHERE ss.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Solicitud no encontrada' };
    }

    log.success(`Detalles de solicitud ${id} obtenidos`);

    return success(res, result.rows[0]);
  } catch (err) {
    log.error('Error al obtener solicitud:', err.message);
    next(err);
  }
};

/**
 * DELETE /api/solicitudes/:id
 * Eliminar solicitud completada
 * @access Private (admin)
 */
const eliminarSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Verificar que la solicitud existe y está completada
    const solicitudResult = await query(
      `SELECT id, estado FROM solicitudes_servicios WHERE id = $1`,
      [id]
    );

    if (solicitudResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Solicitud no encontrada' };
    }

    if (solicitudResult.rows[0].estado !== 'completada') {
      throw { statusCode: 400, message: 'Solo se pueden eliminar solicitudes completadas' };
    }

    // 2. Eliminar solicitud
    const result = await query(
      `DELETE FROM solicitudes_servicios WHERE id = $1 RETURNING id`,
      [id]
    );

    log.success(`Solicitud ${id} eliminada por ${req.user.email}`);

    return success(res, result.rows[0], 'Solicitud eliminada exitosamente');

  } catch (err) {
    log.error('Error al eliminar solicitud:', err.message);
    next(err);
  }
};

module.exports = {
  listarSolicitudes,
  crearSolicitud,
  completarSolicitud,
  obtenerSolicitud,
  eliminarSolicitud
};
