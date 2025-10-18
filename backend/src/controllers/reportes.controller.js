const { query } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

// =============================================================================
// CONTROLADOR DE REPORTES
// =============================================================================

/**
 * POST /api/reportes/ocupacion
 * Generar reporte de ocupación
 * @access Private (admin/recepcionista)
 */
const generarReporte = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin, tipo_periodo } = req.body;
    const generado_por = req.user.id;

    // Llamar a la función PostgreSQL para generar el reporte
    const result = await query(
      `SELECT generar_reporte_ocupacion($1, $2, $3, $4) as reporte_id`,
      [fecha_inicio, fecha_fin, tipo_periodo, generado_por]
    );

    const reporte_id = result.rows[0].reporte_id;

    // Obtener los detalles del reporte generado
    const reporteResult = await query(
      `SELECT
        r.id,
        r.fecha_inicio,
        r.fecha_fin,
        r.tipo_periodo,
        r.total_habitaciones,
        r.habitaciones_ocupadas,
        r.porcentaje_ocupacion,
        r.total_reservas,
        r.creado_en,
        u.nombre || ' ' || u.apellido as generado_por_nombre
      FROM reportes_ocupacion r
      INNER JOIN usuarios u ON r.generado_por = u.id
      WHERE r.id = $1`,
      [reporte_id]
    );

    // ==================== NUEVO: Datos adicionales para gráficas ====================
    const reporte = reporteResult.rows[0];
    const fechaInicio = new Date(reporte.fecha_inicio);
    const fechaFin = new Date(reporte.fecha_fin);
    const diasPeriodo = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

    // Calcular ocupación día por día
    const ocupacionDiariaResult = await query(
      `WITH fechas AS (
        SELECT generate_series($1::date, $2::date, '1 day'::interval)::date as fecha
      )
      SELECT
        f.fecha,
        COALESCE(COUNT(DISTINCT r.habitacion_id), 0) as habitaciones_ocupadas
      FROM fechas f
      LEFT JOIN reservas r ON r.fecha_checkin <= f.fecha AND r.fecha_checkout > f.fecha
      LEFT JOIN estados_reserva e ON r.estado_id = e.id AND e.nombre IN ('confirmada', 'completada')
      GROUP BY f.fecha
      ORDER BY f.fecha`,
      [reporte.fecha_inicio, reporte.fecha_fin]
    );

    // Agregar datos adicionales al reporte
    const reporteConDatos = {
      ...reporte,
      dias_periodo: diasPeriodo,
      total_habitaciones_dia: reporte.total_habitaciones * diasPeriodo,
      promedio_ocupacion_diaria: reporte.habitaciones_ocupadas,
      ocupacion_por_dia: ocupacionDiariaResult.rows
    };
    // ==================== FIN NUEVO ====================

    log.success(`Reporte de ocupación generado (ID: ${reporte_id}) por ${req.user.email}`);

    return success(res, reporteConDatos, 'Reporte generado exitosamente', 201);
  } catch (err) {
    log.error('Error al generar reporte:', err.message);
    next(err);
  }
};

/**
 * GET /api/reportes/ocupacion
 * Listar reportes históricos con filtros
 * @access Private (admin/recepcionista)
 */
const listarReportes = async (req, res, next) => {
  try {
    const { tipo_periodo, fecha_desde, fecha_hasta, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (tipo_periodo) {
      whereClause += ` AND r.tipo_periodo = $${paramCount}`;
      params.push(tipo_periodo);
      paramCount++;
    }

    if (fecha_desde) {
      whereClause += ` AND r.fecha_inicio >= $${paramCount}`;
      params.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      whereClause += ` AND r.fecha_fin <= $${paramCount}`;
      params.push(fecha_hasta);
      paramCount++;
    }

    // Consulta con paginación
    const result = await query(
      `SELECT
        r.id,
        r.fecha_inicio,
        r.fecha_fin,
        r.tipo_periodo,
        r.total_habitaciones,
        r.habitaciones_ocupadas,
        r.porcentaje_ocupacion,
        r.total_reservas,
        r.creado_en,
        u.nombre || ' ' || u.apellido as generado_por_nombre
      FROM reportes_ocupacion r
      INNER JOIN usuarios u ON r.generado_por = u.id
      ${whereClause}
      ORDER BY r.creado_en DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Contar total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM reportes_ocupacion r ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    log.success(`Listado de ${result.rows.length} reportes de ocupación`);

    return success(res, {
      reportes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (err) {
    log.error('Error al listar reportes:', err.message);
    next(err);
  }
};

/**
 * GET /api/reportes/ocupacion/:id
 * Obtener detalles de un reporte específico
 * @access Private (admin/recepcionista)
 */
const obtenerReporte = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        r.id,
        r.fecha_inicio,
        r.fecha_fin,
        r.tipo_periodo,
        r.total_habitaciones,
        r.habitaciones_ocupadas,
        r.porcentaje_ocupacion,
        r.total_reservas,
        r.creado_en,
        u.nombre || ' ' || u.apellido as generado_por_nombre,
        u.email as generado_por_email
      FROM reportes_ocupacion r
      INNER JOIN usuarios u ON r.generado_por = u.id
      WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Reporte no encontrado' };
    }

    // ==================== NUEVO: Datos adicionales para gráficas ====================
    const reporte = result.rows[0];
    const fechaInicio = new Date(reporte.fecha_inicio);
    const fechaFin = new Date(reporte.fecha_fin);
    const diasPeriodo = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;

    // Calcular ocupación día por día
    const ocupacionDiariaResult = await query(
      `WITH fechas AS (
        SELECT generate_series($1::date, $2::date, '1 day'::interval)::date as fecha
      )
      SELECT
        f.fecha,
        COALESCE(COUNT(DISTINCT r.habitacion_id), 0) as habitaciones_ocupadas
      FROM fechas f
      LEFT JOIN reservas r ON r.fecha_checkin <= f.fecha AND r.fecha_checkout > f.fecha
      LEFT JOIN estados_reserva e ON r.estado_id = e.id AND e.nombre IN ('confirmada', 'completada')
      GROUP BY f.fecha
      ORDER BY f.fecha`,
      [reporte.fecha_inicio, reporte.fecha_fin]
    );

    // Agregar datos adicionales al reporte
    const reporteConDatos = {
      ...reporte,
      dias_periodo: diasPeriodo,
      total_habitaciones_dia: reporte.total_habitaciones * diasPeriodo,
      promedio_ocupacion_diaria: reporte.habitaciones_ocupadas,
      ocupacion_por_dia: ocupacionDiariaResult.rows
    };
    // ==================== FIN NUEVO ====================

    log.success(`Detalles de reporte ${id} obtenidos`);

    return success(res, reporteConDatos);
  } catch (err) {
    log.error('Error al obtener reporte:', err.message);
    next(err);
  }
};

module.exports = {
  generarReporte,
  listarReportes,
  obtenerReporte
};
