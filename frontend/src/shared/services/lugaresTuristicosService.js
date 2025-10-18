import api from './api'

/**
 * Servicio de lugares turísticos (Admin)
 */
const lugaresTuristicosService = {
  /**
   * Obtener todos los lugares turísticos
   */
  getLugares: async (params = {}) => {
    const response = await api.get('/lugares-turisticos', { params })
    return response.data.data
  },

  /**
   * Obtener un lugar turístico por ID
   */
  getLugar: async (id) => {
    const response = await api.get(`/lugares-turisticos/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo lugar turístico
   */
  createLugar: async (lugarData) => {
    const response = await api.post('/lugares-turisticos', lugarData)
    return response.data.data
  },

  /**
   * Actualizar lugar turístico
   */
  updateLugar: async (id, lugarData) => {
    const response = await api.put(`/lugares-turisticos/${id}`, lugarData)
    return response.data.data
  },

  /**
   * Desactivar lugar turístico
   */
  deleteLugar: async (id) => {
    const response = await api.delete(`/lugares-turisticos/${id}`)
    return response.data.data
  },

  /**
   * Obtener imágenes de un lugar turístico
   */
  getImagenesLugar: async (lugarId) => {
    const response = await api.get(`/lugares-turisticos/${lugarId}/imagenes`)
    return response.data.data
  },

  /**
   * Vincular imagen de galería a un lugar turístico
   */
  vincularImagen: async (lugarId, imagenData) => {
    const response = await api.post(`/lugares-turisticos/${lugarId}/imagenes`, imagenData)
    return response.data.data
  },

  /**
   * Desvincular imagen de un lugar turístico
   */
  desvincularImagen: async (lugarId, imagenId) => {
    const response = await api.delete(`/lugares-turisticos/${lugarId}/imagenes/${imagenId}`)
    return response.data
  },

  /**
   * Establecer imagen como principal
   */
  setImagenPrincipal: async (lugarId, imagenId) => {
    const response = await api.patch(`/lugares-turisticos/${lugarId}/imagenes/${imagenId}/principal`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getLugares(params) },
  obtener: function(id) { return this.getLugar(id) },
  crear: function(data) { return this.createLugar(data) },
  actualizar: function(id, data) { return this.updateLugar(id, data) },
  desactivar: function(id) { return this.deleteLugar(id) },
  obtenerImagenes: function(id) { return this.getImagenesLugar(id) },
}

export default lugaresTuristicosService
