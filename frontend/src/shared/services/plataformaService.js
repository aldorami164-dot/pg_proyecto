import api from './api'

/**
 * Servicio de plataforma pública
 */
const plataformaService = {
  /**
   * Obtener contenido de la plataforma (público)
   */
  getContenido: async () => {
    const response = await api.get('/plataforma/contenido')
    return response.data.data
  },

  /**
   * Obtener experiencias (público)
   */
  getExperiencias: async (params = {}) => {
    const response = await api.get('/plataforma/experiencias', { params })
    return response.data.data
  },

  /**
   * Obtener lugares turísticos (público)
   */
  getLugaresTuristicos: async (params = {}) => {
    const response = await api.get('/plataforma/lugares-turisticos', { params })
    return response.data.data
  },

  /**
   * Obtener servicios (público)
   */
  getServicios: async () => {
    const response = await api.get('/plataforma/servicios')
    return response.data.data
  },

  /**
   * Crear comentario (público)
   */
  createComentario: async (comentarioData) => {
    const response = await api.post('/plataforma/comentarios', comentarioData)
    return response.data.data
  },

  /**
   * Obtener comentarios (público)
   */
  getComentarios: async (params = {}) => {
    const response = await api.get('/plataforma/comentarios', { params })
    return response.data.data
  },

  /**
   * Obtener imágenes de una experiencia (público)
   */
  getImagenesExperiencia: async (experienciaId) => {
    const response = await api.get(`/plataforma/experiencias/${experienciaId}/imagenes`)
    return response.data.data
  },

  /**
   * Obtener imágenes de un lugar turístico (público)
   */
  getImagenesLugar: async (lugarId) => {
    const response = await api.get(`/plataforma/lugares-turisticos/${lugarId}/imagenes`)
    return response.data.data
  },
}

export default plataformaService
