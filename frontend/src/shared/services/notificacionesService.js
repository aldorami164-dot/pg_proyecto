import api from './api'

/**
 * Servicio de notificaciones
 */
const notificacionesService = {
  /**
   * Obtener todas las notificaciones
   */
  getNotificaciones: async (params = {}) => {
    const response = await api.get('/notificaciones', { params })
    return response.data.data
  },

  /**
   * Obtener una notificación por ID
   */
  getNotificacion: async (id) => {
    const response = await api.get(`/notificaciones/${id}`)
    return response.data.data
  },

  /**
   * Marcar notificación como leída
   */
  marcarLeida: async (id) => {
    const response = await api.patch(`/notificaciones/${id}/leer`)
    return response.data.data
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasLeidas: async () => {
    const response = await api.patch('/notificaciones/leer-todas')
    return response.data.data
  },
}

export default notificacionesService
