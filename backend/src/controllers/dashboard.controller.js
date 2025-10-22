const { query } = require('../config/database');
const { success, error } = require('../utils/response');
const log = require('../utils/logger');

/**
 * GET /api/dashboard/alertas
 * Obtiene alertas inteligentes para el dashboard
 *
 * Retorna contadores de situaciones que requieren atención:
 * - Solicitudes de servicio urgentes (> 2 horas sin atender)
 * - Reservas pendientes que vencen hoy o mañana
 * - Habitaciones en limpieza retrasada (> 4 horas)
 * - Check-ins próximos (en las próximas 2 horas)
 * - Solicitudes con costo pendientes (prioridad alta)
 */
const obtenerAlertas = async (req, res, next) => {
  try {
    const queryText = `
      WITH alertas_calculadas AS (
        -- Solicitudes urgentes (> 2 horas sin atender)
        SELECT
          COUNT(*) FILTER (
            WHERE ss.estado = 'pendiente'
            AND NOW() - ss.creado_en > INTERVAL '2 hours'
          ) as solicitudes_urgentes,

          COUNT(*) FILTER (
            WHERE ss.estado = 'pendiente'
            AND s.tiene_costo = true
          ) as solicitudes_con_costo,

          -- Tiempo promedio de respuesta de solicitudes pendientes (en minutos)
          ROUND(
            AVG(
              EXTRACT(EPOCH FROM (NOW() - ss.creado_en)) / 60
            ) FILTER (WHERE ss.estado = 'pendiente')
          ) as tiempo_promedio_pendientes
        FROM solicitudes_servicios ss
        LEFT JOIN servicios s ON ss.servicio_id = s.id
      ),

      reservas_alertas AS (
        -- Reservas pendientes que vencen hoy o mañana
        SELECT
          COUNT(*) FILTER (
            WHERE r.fecha_checkin = CURRENT_DATE
            AND er.nombre = 'pendiente'
          ) as reservas_vencen_hoy,

          COUNT(*) FILTER (
            WHERE r.fecha_checkin = CURRENT_DATE + INTERVAL '1 day'
            AND er.nombre = 'pendiente'
          ) as reservas_vencen_manana,

          -- Check-ins en próximas 2 horas
          COUNT(*) FILTER (
            WHERE r.fecha_checkin = CURRENT_DATE
            AND er.nombre = 'confirmada'
            AND NOW()::time >= (TIME '14:00:00' - INTERVAL '2 hours')
            AND NOW()::time < TIME '14:00:00'
          ) as checkins_proximos,

          -- Total de reservas pendientes de confirmar
          COUNT(*) FILTER (WHERE er.nombre = 'pendiente') as total_pendientes
        FROM reservas r
        INNER JOIN estados_reserva er ON r.estado_id = er.id
        WHERE er.nombre IN ('pendiente', 'confirmada')
      ),

      habitaciones_alertas AS (
        -- Habitaciones en limpieza retrasada
        SELECT
          COUNT(*) FILTER (
            WHERE hab.estado = 'limpieza'
            AND NOW() - hab.actualizado_en > INTERVAL '4 hours'
          ) as habitaciones_limpieza_retrasada,

          COUNT(*) FILTER (WHERE hab.estado = 'limpieza') as total_en_limpieza,
          COUNT(*) FILTER (WHERE hab.estado = 'mantenimiento') as total_en_mantenimiento
        FROM habitaciones hab
        WHERE hab.activo = true
      )

      SELECT
        -- Solicitudes
        COALESCE(ac.solicitudes_urgentes, 0) as solicitudes_urgentes,
        COALESCE(ac.solicitudes_con_costo, 0) as solicitudes_con_costo,
        COALESCE(ac.tiempo_promedio_pendientes, 0) as tiempo_promedio_pendientes_minutos,

        -- Reservas
        COALESCE(ra.reservas_vencen_hoy, 0) as reservas_vencen_hoy,
        COALESCE(ra.reservas_vencen_manana, 0) as reservas_vencen_manana,
        COALESCE(ra.checkins_proximos, 0) as checkins_proximos,
        COALESCE(ra.total_pendientes, 0) as total_reservas_pendientes,

        -- Habitaciones
        COALESCE(ha.habitaciones_limpieza_retrasada, 0) as habitaciones_limpieza_retrasada,
        COALESCE(ha.total_en_limpieza, 0) as total_en_limpieza,
        COALESCE(ha.total_en_mantenimiento, 0) as total_en_mantenimiento
      FROM alertas_calculadas ac
      CROSS JOIN reservas_alertas ra
      CROSS JOIN habitaciones_alertas ha;
    `;

    const result = await query(queryText);
    const alertas = result.rows[0];

    log.info('Alertas de dashboard calculadas exitosamente');

    return success(res, {
      alertas: {
        // Alertas críticas (rojo)
        criticas: {
          solicitudes_urgentes: parseInt(alertas.solicitudes_urgentes),
          reservas_vencen_hoy: parseInt(alertas.reservas_vencen_hoy),
          habitaciones_limpieza_retrasada: parseInt(alertas.habitaciones_limpieza_retrasada)
        },

        // Alertas de advertencia (amarillo)
        advertencias: {
          reservas_vencen_manana: parseInt(alertas.reservas_vencen_manana),
          solicitudes_con_costo: parseInt(alertas.solicitudes_con_costo),
          checkins_proximos: parseInt(alertas.checkins_proximos)
        },

        // Información adicional
        info: {
          tiempo_promedio_pendientes_minutos: parseInt(alertas.tiempo_promedio_pendientes_minutos),
          total_reservas_pendientes: parseInt(alertas.total_reservas_pendientes),
          total_en_limpieza: parseInt(alertas.total_en_limpieza),
          total_en_mantenimiento: parseInt(alertas.total_en_mantenimiento)
        }
      }
    }, 'Alertas obtenidas correctamente');

  } catch (err) {
    log.error('Error al obtener alertas del dashboard:', err);
    return next(err);
  }
};

/**
 * GET /api/dashboard/stats-detalladas
 * Obtiene estadísticas detalladas para las cards del dashboard
 *
 * Incluye:
 * - Tendencias comparadas con el día anterior
 * - Ocupación histórica de los últimos 7 días
 * - Próxima habitación a liberarse
 */
const obtenerStatsDetalladas = async (req, res, next) => {
  try {
    const queryText = `
      WITH stats_hoy AS (
        -- Estadísticas de hoy
        SELECT
          COUNT(*) FILTER (WHERE er.nombre IN ('pendiente', 'confirmada')) as reservas_activas_hoy,
          COUNT(*) FILTER (WHERE er.nombre = 'pendiente') as reservas_pendientes_hoy,
          COUNT(*) FILTER (
            WHERE r.fecha_checkin = CURRENT_DATE
            AND er.nombre = 'confirmada'
          ) as checkins_hoy
        FROM reservas r
        INNER JOIN estados_reserva er ON r.estado_id = er.id
      ),

      stats_ayer AS (
        -- Estadísticas de ayer para comparación
        SELECT
          COUNT(*) FILTER (WHERE er.nombre IN ('pendiente', 'confirmada')) as reservas_activas_ayer
        FROM reservas r
        INNER JOIN estados_reserva er ON r.estado_id = er.id
        WHERE r.creado_en::date = CURRENT_DATE - INTERVAL '1 day'
      ),

      habitaciones_stats AS (
        SELECT
          COUNT(*) FILTER (WHERE hab.estado = 'disponible') as disponibles,
          COUNT(*) FILTER (WHERE hab.estado = 'ocupada') as ocupadas,
          COUNT(*) FILTER (WHERE hab.estado = 'limpieza') as en_limpieza,
          COUNT(*) FILTER (WHERE hab.estado = 'mantenimiento') as en_mantenimiento,
          COUNT(*) as total
        FROM habitaciones hab
        WHERE hab.activo = true
      ),

      ocupacion_semanal AS (
        -- Ocupación de los últimos 7 días
        SELECT
          json_agg(
            json_build_object(
              'fecha', dia,
              'ocupacion', ROUND((ocupadas::numeric / NULLIF(total, 0)) * 100, 0)
            ) ORDER BY dia DESC
          ) as ocupacion_ultimos_7_dias
        FROM (
          SELECT
            fecha::date as dia,
            COUNT(*) FILTER (WHERE hab.estado = 'ocupada') as ocupadas,
            COUNT(*) as total
          FROM generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          ) AS fecha
          CROSS JOIN habitaciones hab
          WHERE hab.activo = true
          GROUP BY fecha::date
        ) sub
      ),

      proxima_liberacion AS (
        -- Próxima habitación que se liberará (check-out más cercano)
        SELECT
          hab.numero as habitacion_numero,
          r.fecha_checkout,
          EXTRACT(EPOCH FROM (r.fecha_checkout::timestamp - NOW())) / 3600 as horas_hasta_checkout
        FROM reservas r
        INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
        INNER JOIN estados_reserva er ON r.estado_id = er.id
        WHERE er.nombre = 'confirmada'
          AND r.fecha_checkout >= CURRENT_DATE
        ORDER BY r.fecha_checkout ASC
        LIMIT 1
      )

      SELECT
        -- Stats de hoy
        COALESCE(sh.reservas_activas_hoy, 0) as reservas_activas,
        COALESCE(sh.reservas_pendientes_hoy, 0) as reservas_pendientes,
        COALESCE(sh.checkins_hoy, 0) as checkins_hoy,

        -- Tendencia (diferencia con ayer)
        COALESCE(sh.reservas_activas_hoy, 0) - COALESCE(sa.reservas_activas_ayer, 0) as tendencia_reservas,

        -- Habitaciones
        COALESCE(hs.disponibles, 0) as habitaciones_disponibles,
        COALESCE(hs.ocupadas, 0) as habitaciones_ocupadas,
        COALESCE(hs.en_limpieza, 0) as habitaciones_en_limpieza,
        COALESCE(hs.en_mantenimiento, 0) as habitaciones_en_mantenimiento,
        COALESCE(hs.total, 0) as total_habitaciones,

        -- Ocupación actual y semanal
        CASE
          WHEN COALESCE(hs.total, 0) > 0
          THEN ROUND((COALESCE(hs.ocupadas, 0)::numeric / hs.total) * 100, 0)
          ELSE 0
        END as ocupacion_porcentaje,

        COALESCE(os.ocupacion_ultimos_7_dias, '[]'::json) as ocupacion_ultimos_7_dias,

        -- Próxima liberación
        pl.habitacion_numero as proxima_habitacion_liberar,
        pl.fecha_checkout as proxima_fecha_checkout,
        ROUND(COALESCE(pl.horas_hasta_checkout, 0)) as horas_hasta_proxima_liberacion

      FROM stats_hoy sh
      CROSS JOIN stats_ayer sa
      CROSS JOIN habitaciones_stats hs
      CROSS JOIN ocupacion_semanal os
      LEFT JOIN proxima_liberacion pl ON true;
    `;

    const result = await query(queryText);
    const stats = result.rows[0];

    log.info('Stats detalladas del dashboard obtenidas exitosamente');

    return success(res, {
      stats: {
        reservas: {
          activas: parseInt(stats.reservas_activas),
          pendientes: parseInt(stats.reservas_pendientes),
          checkins_hoy: parseInt(stats.checkins_hoy),
          tendencia: parseInt(stats.tendencia_reservas) // positivo = más que ayer, negativo = menos
        },
        habitaciones: {
          disponibles: parseInt(stats.habitaciones_disponibles),
          ocupadas: parseInt(stats.habitaciones_ocupadas),
          en_limpieza: parseInt(stats.habitaciones_en_limpieza),
          en_mantenimiento: parseInt(stats.habitaciones_en_mantenimiento),
          total: parseInt(stats.total_habitaciones),
          proxima_liberar: {
            numero: stats.proxima_habitacion_liberar,
            fecha: stats.proxima_fecha_checkout,
            horas_restantes: parseInt(stats.horas_hasta_proxima_liberacion)
          }
        },
        ocupacion: {
          porcentaje_actual: parseInt(stats.ocupacion_porcentaje),
          ultimos_7_dias: stats.ocupacion_ultimos_7_dias || []
        }
      }
    }, 'Estadísticas detalladas obtenidas correctamente');

  } catch (err) {
    log.error('Error al obtener stats detalladas del dashboard:', err);
    return next(err);
  }
};

/**
 * GET /api/dashboard/acciones-rapidas
 * Obtiene datos para el panel de acciones rápidas
 *
 * Retorna:
 * - Top 3 reservas pendientes más antiguas
 * - Top 3 solicitudes pendientes más antiguas
 * - Habitaciones ocupadas (para check-out rápido)
 */
const obtenerAccionesRapidas = async (req, res, next) => {
  try {
    const queryText = `
      WITH reservas_pendientes AS (
        SELECT
          r.id,
          r.codigo_reserva,
          h.nombre || ' ' || h.apellido as huesped_nombre,
          hab.numero as habitacion_numero,
          r.fecha_checkin,
          r.fecha_checkout,
          r.creado_en,
          EXTRACT(EPOCH FROM (NOW() - r.creado_en)) / 3600 as horas_pendiente
        FROM reservas r
        INNER JOIN huespedes h ON r.huesped_id = h.id
        INNER JOIN habitaciones hab ON r.habitacion_id = hab.id
        INNER JOIN estados_reserva er ON r.estado_id = er.id
        WHERE er.nombre = 'pendiente'
        ORDER BY r.creado_en ASC
        LIMIT 3
      ),

      solicitudes_pendientes AS (
        SELECT
          ss.id,
          hab.numero as habitacion_numero,
          s.nombre as servicio_nombre,
          s.tiene_costo,
          ss.creado_en,
          EXTRACT(EPOCH FROM (NOW() - ss.creado_en)) / 3600 as horas_pendiente
        FROM solicitudes_servicios ss
        INNER JOIN habitaciones hab ON ss.habitacion_id = hab.id
        INNER JOIN servicios s ON ss.servicio_id = s.id
        WHERE ss.estado = 'pendiente'
        ORDER BY s.tiene_costo DESC, ss.creado_en ASC
        LIMIT 3
      ),

      habitaciones_ocupadas AS (
        SELECT
          hab.id,
          hab.numero,
          r.id as reserva_id,
          r.codigo_reserva,
          h.nombre || ' ' || h.apellido as huesped_nombre,
          r.fecha_checkout
        FROM habitaciones hab
        INNER JOIN reservas r ON hab.id = r.habitacion_id
        INNER JOIN estados_reserva er ON r.estado_id = er.id
        INNER JOIN huespedes h ON r.huesped_id = h.id
        WHERE hab.estado = 'ocupada'
          AND er.nombre = 'confirmada'
          AND r.fecha_checkin <= CURRENT_DATE  -- Ya hicieron check-in
          AND r.fecha_checkout > CURRENT_DATE  -- Todavía no hacen check-out
        ORDER BY hab.numero ASC
      )

      SELECT
        (SELECT json_agg(rp.*) FROM reservas_pendientes rp) as reservas_pendientes,
        (SELECT json_agg(sp.*) FROM solicitudes_pendientes sp) as solicitudes_pendientes,
        (SELECT json_agg(ho.*) FROM habitaciones_ocupadas ho) as habitaciones_ocupadas;
    `;

    const result = await query(queryText);
    const data = result.rows[0];

    log.info('Datos para acciones rápidas obtenidos exitosamente');

    return success(res, {
      acciones_rapidas: {
        reservas_pendientes: data.reservas_pendientes || [],
        solicitudes_pendientes: data.solicitudes_pendientes || [],
        habitaciones_ocupadas: data.habitaciones_ocupadas || []
      }
    }, 'Datos de acciones rápidas obtenidos correctamente');

  } catch (err) {
    log.error('Error al obtener datos de acciones rápidas:', err);
    return next(err);
  }
};

/**
 * POST /api/dashboard/procesar-reservas-vencidas
 * Auto-cancela reservas pendientes cuya fecha de check-in ya pasó
 *
 * Ejecuta automáticamente al cargar el dashboard para mantener datos limpios
 */
const procesarReservasVencidas = async (req, res, next) => {
  try {
    const queryText = `
      UPDATE reservas
      SET
        estado_id = (SELECT id FROM estados_reserva WHERE nombre = 'cancelada'),
        notas = COALESCE(notas || E'\n\n', '') || '[AUTO-CANCELADA] No confirmada antes de la fecha de check-in (' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || ')',
        fecha_cancelacion = NOW(),
        actualizado_en = NOW()
      WHERE estado_id = (SELECT id FROM estados_reserva WHERE nombre = 'pendiente')
        AND fecha_checkin < CURRENT_DATE
      RETURNING id, codigo_reserva, fecha_checkin;
    `;

    const result = await query(queryText);
    const reservasCanceladas = result.rows;

    if (reservasCanceladas.length > 0) {
      log.info(`Auto-canceladas ${reservasCanceladas.length} reservas vencidas:`,
        reservasCanceladas.map(r => r.codigo_reserva).join(', '));
    }

    return success(res, {
      reservas_canceladas: reservasCanceladas.length,
      detalles: reservasCanceladas
    }, `${reservasCanceladas.length} reservas vencidas procesadas`);

  } catch (err) {
    log.error('Error al procesar reservas vencidas:', err);
    return next(err);
  }
};

module.exports = {
  obtenerAlertas,
  obtenerStatsDetalladas,
  obtenerAccionesRapidas,
  procesarReservasVencidas
};
