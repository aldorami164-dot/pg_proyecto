import api from './api'

/**
 * Servicio de Dashboard
 * Maneja las estadísticas, alertas y acciones rápidas del dashboard principal
 */
const dashboardService = {
  /**
   * Obtener alertas inteligentes del dashboard
   *
   * @returns {Promise<Object>} Objeto con alertas críticas, advertencias e info
   * @example
   * {
   *   alertas: {
   *     criticas: { solicitudes_urgentes: 2, reservas_vencen_hoy: 1, ... },
   *     advertencias: { reservas_vencen_manana: 3, solicitudes_con_costo: 1, ... },
   *     info: { tiempo_promedio_pendientes_minutos: 45, ... }
   *   }
   * }
   */
  obtenerAlertas: async () => {
    try {
      const response = await api.get('/dashboard/alertas')
      return response.data.data
    } catch (error) {
      console.error('Error al obtener alertas del dashboard:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas detalladas para las cards del dashboard
   *
   * @returns {Promise<Object>} Objeto con stats detalladas incluyendo tendencias
   * @example
   * {
   *   stats: {
   *     reservas: { activas: 12, pendientes: 3, tendencia: 2, ... },
   *     habitaciones: { disponibles: 8, ocupadas: 7, total: 15, ... },
   *     ocupacion: { porcentaje_actual: 73, ultimos_7_dias: [...] }
   *   }
   * }
   */
  obtenerStatsDetalladas: async () => {
    try {
      const response = await api.get('/dashboard/stats-detalladas')
      return response.data.data
    } catch (error) {
      console.error('Error al obtener stats detalladas del dashboard:', error)
      throw error
    }
  },

  /**
   * Obtener datos para el panel de acciones rápidas
   *
   * @returns {Promise<Object>} Objeto con top reservas/solicitudes pendientes y habitaciones ocupadas
   * @example
   * {
   *   acciones_rapidas: {
   *     reservas_pendientes: [{ id, codigo_reserva, huesped_nombre, ... }],
   *     solicitudes_pendientes: [{ id, habitacion_numero, servicio_nombre, ... }],
   *     habitaciones_ocupadas: [{ id, numero, reserva_id, ... }]
   *   }
   * }
   */
  obtenerAccionesRapidas: async () => {
    try {
      const response = await api.get('/dashboard/acciones-rapidas')
      return response.data.data
    } catch (error) {
      console.error('Error al obtener acciones rápidas:', error)
      throw error
    }
  },

  /**
   * Procesar reservas vencidas (auto-cancelación)
   *
   * Cancela automáticamente las reservas PENDIENTES cuya fecha de check-in ya pasó
   *
   * @returns {Promise<Object>} Número de reservas canceladas
   * @example
   * { reservas_canceladas: 3, detalles: [...] }
   */
  procesarReservasVencidas: async () => {
    try {
      const response = await api.post('/dashboard/procesar-reservas-vencidas')
      return response.data.data
    } catch (error) {
      console.error('Error al procesar reservas vencidas:', error)
      throw error
    }
  }
}

export default dashboardService
