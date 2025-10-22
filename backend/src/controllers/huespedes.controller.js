const { query } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/huespedes
 * Listar huéspedes con filtros por estado de reserva
 * Query params:
 * - tipo: 'activos' | 'checkin' | 'historicos' | 'todos'
 * - search: búsqueda por nombre, apellido, email, teléfono, DPI
 * - page: número de página (default: 1)
 * - limit: resultados por página (default: 20)
 */
const listar = async (req, res, next) => {
  try {
    const {
      tipo = 'todos',
      search = '',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    let queryParams = [];
    let paramIndex = 1;

    // Filtrar por tipo de huésped según estado de reservas
    if (tipo === 'activos') {
      // Huéspedes con reservas futuras (pendientes o confirmadas pero que aún NO han llegado)
      whereClause = `
        WHERE h.id IN (
          SELECT DISTINCT r.huesped_id
          FROM reservas r
          INNER JOIN estados_reserva er ON r.estado_id = er.id
          WHERE er.nombre IN ('pendiente', 'confirmada')
            AND r.fecha_checkin > CURRENT_DATE
        )
      `;
    } else if (tipo === 'checkin') {
      // Huéspedes actualmente hospedados (reservas confirmadas que ya hicieron check-in y aún no hacen check-out)
      whereClause = `
        WHERE h.id IN (
          SELECT DISTINCT r.huesped_id
          FROM reservas r
          INNER JOIN estados_reserva er ON r.estado_id = er.id
          WHERE er.nombre = 'confirmada'
            AND r.fecha_checkin <= CURRENT_DATE
            AND r.fecha_checkout > CURRENT_DATE
        )
      `;
    } else if (tipo === 'historicos') {
      // Huéspedes que SOLO tienen reservas completadas o canceladas (ya no están activos)
      whereClause = `
        WHERE h.id NOT IN (
          SELECT DISTINCT r.huesped_id
          FROM reservas r
          INNER JOIN estados_reserva er ON r.estado_id = er.id
          WHERE er.nombre IN ('pendiente', 'confirmada')
        )
      `;
    }
    // Si tipo='todos', no agregar filtro WHERE

    // Búsqueda por nombre, apellido, email, teléfono o DPI
    if (search.trim()) {
      const searchCondition = whereClause
        ? 'AND'
        : 'WHERE';

      whereClause += `
        ${searchCondition} (
          LOWER(h.nombre) LIKE LOWER($${paramIndex}) OR
          LOWER(h.apellido) LIKE LOWER($${paramIndex}) OR
          LOWER(h.email) LIKE LOWER($${paramIndex}) OR
          h.telefono LIKE $${paramIndex} OR
          h.dpi_pasaporte LIKE $${paramIndex}
        )
      `;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Consulta principal con información de reservas
    const sqlQuery = `
      SELECT
        h.*,
        COUNT(DISTINCT r.id) FILTER (WHERE er.nombre = 'pendiente') as reservas_pendientes,
        COUNT(DISTINCT r.id) FILTER (WHERE er.nombre = 'confirmada') as reservas_confirmadas,
        COUNT(DISTINCT r.id) FILTER (WHERE er.nombre = 'completada') as reservas_completadas,
        COUNT(DISTINCT r.id) FILTER (WHERE er.nombre = 'cancelada') as reservas_canceladas,
        COUNT(DISTINCT r.id) as total_reservas,
        MAX(r.fecha_checkout) FILTER (WHERE er.nombre IN ('pendiente', 'confirmada')) as proxima_salida,
        MIN(r.fecha_checkin) FILTER (WHERE er.nombre IN ('pendiente', 'confirmada') AND r.fecha_checkin > CURRENT_DATE) as proxima_entrada
      FROM huespedes h
      LEFT JOIN reservas r ON h.id = r.huesped_id
      LEFT JOIN estados_reserva er ON r.estado_id = er.id
      ${whereClause}
      GROUP BY h.id
      ORDER BY h.creado_en DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    // Ejecutar consulta
    const result = await query(sqlQuery, queryParams);

    // Contar total de registros para paginación
    const countQuery = `
      SELECT COUNT(DISTINCT h.id) as total
      FROM huespedes h
      LEFT JOIN reservas r ON h.id = r.huesped_id
      LEFT JOIN estados_reserva er ON r.estado_id = er.id
      ${whereClause}
    `;

    const countParams = search.trim() ? [`%${search}%`] : [];
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return success(res, {
      huespedes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    log.error('Error al listar huéspedes:', err);
    next(err);
  }
};

/**
 * GET /api/huespedes/:id
 * Obtener detalle de un huésped con todas sus reservas
 */
const obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener datos del huésped
    const huespedResult = await query(
      'SELECT * FROM huespedes WHERE id = $1',
      [id]
    );

    if (huespedResult.rows.length === 0) {
      return error(res, 'Huésped no encontrado', 404);
    }

    const huesped = huespedResult.rows[0];

    // Obtener todas las reservas del huésped
    const reservasResult = await query(
      `SELECT
        r.*,
        er.nombre as estado,
        er.color_hex as estado_color,
        hab.numero as habitacion_numero,
        th.nombre as tipo_habitacion
      FROM reservas r
      INNER JOIN estados_reserva er ON r.estado_id = er.id
      INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
      INNER JOIN tipos_habitacion th ON hab.tipo_habitacion_id = th.id
      WHERE r.huesped_id = $1
      ORDER BY r.fecha_checkin DESC`,
      [id]
    );

    return success(res, {
      ...huesped,
      reservas: reservasResult.rows
    });

  } catch (err) {
    log.error('Error al obtener huésped:', err);
    next(err);
  }
};

/**
 * PUT /api/huespedes/:id
 * Actualizar información de un huésped
 */
const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      dpi_pasaporte,
      email,
      telefono,
      pais,
      direccion,
      fecha_nacimiento
    } = req.body;

    // Verificar que el huésped existe
    const checkResult = await query(
      'SELECT id FROM huespedes WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return error(res, 'Huésped no encontrado', 404);
    }

    // Construir query dinámico solo con campos proporcionados
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramIndex}`);
      values.push(nombre);
      paramIndex++;
    }
    if (apellido !== undefined) {
      updates.push(`apellido = $${paramIndex}`);
      values.push(apellido);
      paramIndex++;
    }
    if (dpi_pasaporte !== undefined) {
      updates.push(`dpi_pasaporte = $${paramIndex}`);
      values.push(dpi_pasaporte);
      paramIndex++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    if (telefono !== undefined) {
      updates.push(`telefono = $${paramIndex}`);
      values.push(telefono);
      paramIndex++;
    }
    if (pais !== undefined) {
      updates.push(`pais = $${paramIndex}`);
      values.push(pais);
      paramIndex++;
    }
    if (direccion !== undefined) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
    }
    if (fecha_nacimiento !== undefined) {
      updates.push(`fecha_nacimiento = $${paramIndex}`);
      values.push(fecha_nacimiento);
      paramIndex++;
    }

    if (updates.length === 0) {
      return error(res, 'No se proporcionaron campos para actualizar', 400);
    }

    // Agregar actualizado_en
    updates.push(`actualizado_en = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE huespedes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    log.success(`Huésped actualizado: ID ${id}`);

    return success(res, result.rows[0], 'Huésped actualizado exitosamente');

  } catch (err) {
    log.error('Error al actualizar huésped:', err);
    next(err);
  }
};

/**
 * DELETE /api/huespedes/:id
 * Eliminar huésped SOLO si todas sus reservas están completadas o canceladas
 */
const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el huésped existe
    const checkResult = await query(
      'SELECT id, nombre, apellido FROM huespedes WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return error(res, 'Huésped no encontrado', 404);
    }

    const huesped = checkResult.rows[0];

    // VALIDACIÓN CRÍTICA: Verificar que NO tenga reservas activas (pendiente o confirmada)
    const reservasActivasResult = await query(
      `SELECT COUNT(*) as total
       FROM reservas r
       INNER JOIN estados_reserva er ON r.estado_id = er.id
       WHERE r.huesped_id = $1
       AND er.nombre IN ('pendiente', 'confirmada')`,
      [id]
    );

    const reservasActivas = parseInt(reservasActivasResult.rows[0].total);

    if (reservasActivas > 0) {
      return error(
        res,
        `No se puede eliminar el huésped porque tiene ${reservasActivas} reserva(s) activa(s). Solo se pueden eliminar huéspedes con todas las reservas completadas o canceladas.`,
        409
      );
    }

    // Si llegamos aquí, el huésped solo tiene reservas completadas/canceladas o no tiene reservas
    // Eliminar el huésped
    await query('DELETE FROM huespedes WHERE id = $1', [id]);

    log.success(`Huésped eliminado: ${huesped.nombre} ${huesped.apellido} (ID ${id})`);

    return success(res, null, 'Huésped eliminado exitosamente');

  } catch (err) {
    log.error('Error al eliminar huésped:', err);

    // Error de integridad referencial (no debería ocurrir con la validación previa)
    if (err.code === '23503') {
      return error(res, 'No se puede eliminar el huésped porque tiene registros asociados', 409);
    }

    next(err);
  }
};

module.exports = {
  listar,
  obtener,
  actualizar,
  eliminar
};
