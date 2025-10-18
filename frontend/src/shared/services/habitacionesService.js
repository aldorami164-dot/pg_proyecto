import api from './api'

/**
 * Servicio de habitaciones
 */
const habitacionesService = {
  /**
   * Obtener todas las habitaciones
   */
  getHabitaciones: async (params = {}) => {
    const response = await api.get('/habitaciones', { params })
    return response.data.data
  },

  /**
   * Obtener una habitación por ID
   */
  getHabitacion: async (id) => {
    const response = await api.get(`/habitaciones/${id}`)
    return response.data.data
  },

  /**
   * Crear nueva habitación
   */
  createHabitacion: async (habitacionData) => {
    const response = await api.post('/habitaciones', habitacionData)
    return response.data.data
  },

  /**
   * Actualizar habitación
   */
  updateHabitacion: async (id, habitacionData) => {
    const response = await api.put(`/habitaciones/${id}`, habitacionData)
    return response.data.data
  },

  /**
   * Eliminar habitación
   */
  deleteHabitacion: async (id) => {
    const response = await api.delete(`/habitaciones/${id}`)
    return response.data.data
  },

  /**
   * Cambiar estado de habitación
   */
  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/habitaciones/${id}/estado`, { estado })
    return response.data.data
  },

  /**
   * Obtener imágenes de una habitación
   */
  getImagenesHabitacion: async (habitacionId) => {
    const response = await api.get(`/habitaciones/${habitacionId}/imagenes`)
    return response.data.data
  },

  /**
   * Vincular imagen de galería a una habitación
   */
  vincularImagen: async (habitacionId, imagenData) => {
    const response = await api.post(`/habitaciones/${habitacionId}/imagenes`, imagenData)
    return response.data.data
  },

  /**
   * Desvincular imagen de una habitación
   */
  desvincularImagen: async (habitacionId, imagenId) => {
    const response = await api.delete(`/habitaciones/${habitacionId}/imagenes/${imagenId}`)
    return response.data
  },

  /**
   * Establecer imagen como principal
   */
  setImagenPrincipal: async (habitacionId, imagenId) => {
    const response = await api.patch(`/habitaciones/${habitacionId}/imagenes/${imagenId}/principal`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getHabitaciones(params) },
  crear: function(data) { return this.createHabitacion(data) },
  actualizar: function(id, data) { return this.updateHabitacion(id, data) },
  desactivar: function(id) { return this.deleteHabitacion(id) },
}

export default habitacionesService
