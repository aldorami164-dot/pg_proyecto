import api from './api'

/**
 * Servicio de experiencias turísticas (Admin)
 */
const experienciasService = {
  /**
   * Obtener todas las experiencias
   */
  getExperiencias: async (params = {}) => {
    const response = await api.get('/experiencias', { params })
    return response.data.data
  },

  /**
   * Obtener una experiencia por ID
   */
  getExperiencia: async (id) => {
    const response = await api.get(`/experiencias/${id}`)
    return response.data.data
  },

  /**
   * Crear nueva experiencia
   */
  createExperiencia: async (experienciaData) => {
    const response = await api.post('/experiencias', experienciaData)
    return response.data.data
  },

  /**
   * Actualizar experiencia
   */
  updateExperiencia: async (id, experienciaData) => {
    const response = await api.put(`/experiencias/${id}`, experienciaData)
    return response.data.data
  },

  /**
   * Desactivar experiencia
   */
  deleteExperiencia: async (id) => {
    const response = await api.delete(`/experiencias/${id}`)
    return response.data.data
  },

  /**
   * Obtener imágenes de una experiencia
   */
  getImagenesExperiencia: async (experienciaId) => {
    const response = await api.get(`/experiencias/${experienciaId}/imagenes`)
    return response.data.data
  },

  /**
   * Vincular imagen de galería a una experiencia
   */
  vincularImagen: async (experienciaId, imagenData) => {
    const response = await api.post(`/experiencias/${experienciaId}/imagenes`, imagenData)
    return response.data.data
  },

  /**
   * Desvincular imagen de una experiencia
   */
  desvincularImagen: async (experienciaId, imagenId) => {
    const response = await api.delete(`/experiencias/${experienciaId}/imagenes/${imagenId}`)
    return response.data
  },

  /**
   * Establecer imagen como principal
   */
  setImagenPrincipal: async (experienciaId, imagenId) => {
    const response = await api.patch(`/experiencias/${experienciaId}/imagenes/${imagenId}/principal`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getExperiencias(params) },
  obtener: function(id) { return this.getExperiencia(id) },
  crear: function(data) { return this.createExperiencia(data) },
  actualizar: function(id, data) { return this.updateExperiencia(id, data) },
  desactivar: function(id) { return this.deleteExperiencia(id) },
  obtenerImagenes: function(id) { return this.getImagenesExperiencia(id) },
}

export default experienciasService
