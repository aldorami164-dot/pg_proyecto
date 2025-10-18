import api from './api'

/**
 * Servicio de autenticación
 */
const authService = {
  /**
   * Login de usuario
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })

    // El backend envuelve la respuesta en: { success, message, data }
    const { user, accessToken, refreshToken } = response.data.data

    // Guardar tokens y usuario en localStorage
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    return { usuario: user }
  },

  /**
   * Logout de usuario
   */
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Error al hacer logout:', error)
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  /**
   * Refrescar access token
   */
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    const { accessToken } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    return response.data
  },

  /**
   * Obtener información del usuario actual
   */
  me: async () => {
    const response = await api.get('/auth/me')
    // El backend retorna el usuario directamente en data
    const usuario = response.data.data
    localStorage.setItem('user', JSON.stringify(usuario))
    return { data: { usuario } }
  },

  /**
   * Obtener usuario desde localStorage
   */
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Obtener token desde localStorage
   */
  getToken: () => {
    return localStorage.getItem('accessToken')
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },
}

export default authService
