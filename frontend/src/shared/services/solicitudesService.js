import api from './api'

/**
 * Servicio de solicitudes de servicio
 */
const solicitudesService = {
  /**
   * Obtener todas las solicitudes
   */
  getSolicitudes: async (params = {}) => {
    const response = await api.get('/solicitudes', { params })
    return response.data.data
  },

  /**
   * Obtener una solicitud por ID
   */
  getSolicitud: async (id) => {
    const response = await api.get(`/solicitudes/${id}`)
    return response.data.data
  },

  /**
   * Crear nueva solicitud (público - desde código QR)
   */
  createSolicitud: async (solicitudData) => {
    const response = await api.post('/solicitudes', solicitudData)
    return response.data.data
  },

  /**
   * Completar solicitud
   */
  completarSolicitud: async (id, notas) => {
    const response = await api.patch(`/solicitudes/${id}/completar`, { notas })
    return response.data.data
  },

  /**
   * Eliminar solicitud completada
   */
  eliminarSolicitud: async (id) => {
    const response = await api.delete(`/solicitudes/${id}`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getSolicitudes(params) },
  completar: function(id, notas) { return this.completarSolicitud(id, notas) },
  eliminar: function(id) { return this.eliminarSolicitud(id) },
}

export default solicitudesService
