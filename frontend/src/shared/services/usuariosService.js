import api from './api'

/**
 * Servicio de usuarios
 */
const usuariosService = {
  /**
   * Obtener todos los usuarios
   */
  getUsuarios: async (params = {}) => {
    const response = await api.get('/usuarios', { params })
    return response.data.data
  },

  /**
   * Obtener un usuario por ID
   */
  getUsuario: async (id) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo usuario
   */
  createUsuario: async (usuarioData) => {
    const response = await api.post('/usuarios', usuarioData)
    return response.data.data
  },

  /**
   * Actualizar usuario
   */
  updateUsuario: async (id, usuarioData) => {
    const response = await api.put(`/usuarios/${id}`, usuarioData)
    return response.data.data
  },

  /**
   * Activar/Desactivar usuario
   */
  toggleActivo: async (id) => {
    const response = await api.patch(`/usuarios/${id}/toggle-activo`)
    return response.data.data
  },

  // Alias para compatibilidad con las páginas
  listar: function(params) { return this.getUsuarios(params) },
  crear: function(data) { return this.createUsuario(data) },
  actualizar: function(id, data) { return this.updateUsuario(id, data) },
  toggle: function(id) { return this.toggleActivo(id) },
}

export default usuariosService
