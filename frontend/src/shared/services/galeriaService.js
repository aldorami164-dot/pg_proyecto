import api from './api'

/**
 * Servicio de galería
 */
const galeriaService = {
  /**
   * Obtener todas las imágenes de la galería (público)
   */
  getImagenes: async (params = {}) => {
    const response = await api.get('/galeria', { params })
    return response.data.data
  },

  /**
   * Subir imagen a la galería
   */
  uploadImagen: async (formData) => {
    const response = await api.post('/galeria', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * Actualizar imagen de la galería
   */
  updateImagen: async (id, imagenData) => {
    const response = await api.put(`/galeria/${id}`, imagenData)
    return response.data.data
  },

  /**
   * Eliminar imagen de la galería
   */
  deleteImagen: async (id) => {
    const response = await api.delete(`/galeria/${id}`)
    return response.data.data
  },

  /**
   * Activar/Desactivar imagen
   */
  toggleActivo: async (id) => {
    const response = await api.patch(`/galeria/${id}/toggle-activo`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getImagenes(params) },
  subir: function(formData) { return this.uploadImagen(formData) },
  actualizar: function(id, data) { return this.updateImagen(id, data) },
  eliminar: function(id) { return this.deleteImagen(id) },
  toggle: function(id) { return this.toggleActivo(id) },
}

export default galeriaService
