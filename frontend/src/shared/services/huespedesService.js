import api from './api'

/**
 * Servicio de huéspedes
 */
const huespedesService = {
  /**
   * Obtener todos los huéspedes con filtros
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.tipo - 'activos' | 'checkin' | 'historicos' | 'todos'
   * @param {string} params.search - Búsqueda por nombre, apellido, email, teléfono, DPI
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Resultados por página
   */
  listar: async (params = {}) => {
    const response = await api.get('/huespedes', { params })
    return response.data.data
  },

  /**
   * Obtener detalle de un huésped con sus reservas
   * @param {number} id - ID del huésped
   */
  obtener: async (id) => {
    const response = await api.get(`/huespedes/${id}`)
    return response.data.data
  },

  /**
   * Actualizar información de un huésped
   * @param {number} id - ID del huésped
   * @param {Object} data - Datos a actualizar
   */
  actualizar: async (id, data) => {
    // Sanitizar fecha_nacimiento si existe
    const sanitizedData = {
      ...data,
      fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento) : undefined
    }
    const response = await api.put(`/huespedes/${id}`, sanitizedData)
    return response.data.data
  },

  /**
   * Eliminar un huésped
   * Solo se puede eliminar si todas sus reservas están completadas o canceladas
   * @param {number} id - ID del huésped
   */
  eliminar: async (id) => {
    const response = await api.delete(`/huespedes/${id}`)
    return response.data
  },

  /**
   * Obtener huéspedes activos (con reservas pendientes)
   */
  obtenerActivos: async () => {
    return huespedesService.listar({ tipo: 'activos' })
  },

  /**
   * Obtener huéspedes con check-in (actualmente en el hotel)
   */
  obtenerEnHotel: async () => {
    return huespedesService.listar({ tipo: 'checkin' })
  },

  /**
   * Obtener huéspedes históricos (solo reservas completadas/canceladas)
   */
  obtenerHistoricos: async () => {
    return huespedesService.listar({ tipo: 'historicos' })
  },
}

export default huespedesService
